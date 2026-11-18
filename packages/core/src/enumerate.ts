import { Story } from "inkjs/engine/Story";
import { InkList } from "inkjs/engine/InkList";
import type { CompiledStory } from "./compile";
import { hash, stableStringify } from "./util";

export type TraceStep =
  | { kind: "knot"; path: string }
  | { kind: "line"; text: string; tags?: string[] }
  | { kind: "choice"; index: number; text: string };

/** Ink values as plain JSON. Lists become sorted arrays of "list.item" names. */
export type InkValue = number | string | boolean | string[] | null;

/** One distinct story state at the moment the target scene is entered. */
export interface Arrival {
  key: string;
  variables: Record<string, InkValue>;
  /** Visit counts of knots and stitches before entering the target. Zero counts are omitted. */
  visits: Record<string, number>;
  /** Number of (seed, choice sequence) pairs that reach this state, within caps. */
  pathCount: number;
  /** Up to `maxExamples` full traces from story start to the target. */
  examples: TraceStep[][];
  seeds: number[];
}

export interface EnumerateOptions {
  /** Knot or stitch to check, e.g. "campfire" or "campfire.late". */
  target: string;
  /** Maximum choices along one path. Default 100. */
  maxDepth?: number;
  /** Stop a path when any knot, stitch, choice, or gather is visited more than this. Default 6. */
  maxVisitsPerKnot?: number;
  /** Total choice points to explore before giving up. Default 20000. */
  maxChoicePoints?: number;
  /** Example traces kept per arrival. Default 3. */
  maxExamples?: number;
  /** Story seeds to explore. RANDOM and shuffles are deterministic per seed. Default [0]. */
  seeds?: number[];
  /** Stubs for EXTERNAL functions. Unbound externals without an ink fallback return 0. */
  externals?: Record<string, (...args: any[]) => unknown>;
}

export interface EnumerationResult {
  target: string;
  arrivals: Arrival[];
  stats: {
    choicePoints: number;
    /** Choice points skipped because an identical state was already explored. */
    duplicateStates: number;
    /** Paths that ended without reaching the target. */
    endings: number;
    pathsToTarget: number;
  };
  caps: {
    /** Paths cut by maxDepth. */
    depth: number;
    /** Paths cut by maxVisitsPerKnot, per knot. */
    visits: Record<string, number>;
    /** True if maxChoicePoints ran out. */
    budget: boolean;
  };
  /** True when no cap was hit, so `arrivals` covers every reachable state. */
  complete: boolean;
  warnings: string[];
}

const DEFAULTS = {
  maxDepth: 100,
  maxVisitsPerKnot: 6,
  maxChoicePoints: 20000,
  maxExamples: 3,
};

/** Steps from story start, stored as a parent-linked list so branches share their prefix. */
interface Prefix {
  steps: TraceStep[];
  parent: Prefix | null;
}

/** Steps from some point to the target, linked forward. */
interface Suffix {
  steps: TraceStep[];
  next: Suffix | null;
}

/** Arrivals reachable from one point, keyed by arrival key. */
type Reachable = Map<string, { count: number; suffix: Suffix }>;

interface SubResult {
  reachable: Reachable;
  /** True if maxDepth cut something below, so the result may grow when reached from shallower. */
  truncated: boolean;
}

interface Capture {
  variables: Record<string, InkValue>;
  visits: Record<string, number>;
  /** Trace steps emitted in the current segment before the target was entered. */
  steps: TraceStep[];
}

class RunawayLoop extends Error {}

/** Runtime steps allowed in one Continue() before we call it a runaway loop. */
const MAX_STEPS_PER_CONTINUE = 1_000_000;

export function enumerateStates(compiled: CompiledStory, options: EnumerateOptions): EnumerationResult {
  const target = compiled.flows.get(options.target);
  if (!target || target.kind === "function") {
    const known = [...compiled.flows.values()].filter((f) => f.kind !== "function").map((f) => f.path);
    throw new Error(`Unknown target "${options.target}". Knots and stitches: ${known.join(", ")}`);
  }

  const result: EnumerationResult = {
    target: options.target,
    arrivals: [],
    stats: { choicePoints: 0, duplicateStates: 0, endings: 0, pathsToTarget: 0 },
    caps: { depth: 0, visits: {}, budget: false },
    complete: true,
    warnings: [],
  };

  const seeds = options.seeds ?? [0];
  if (compiled.features.random && !options.seeds) {
    result.warnings.push(
      "Story uses RANDOM or shuffles but only seed 0 was explored. Pass several seeds to cover more outcomes.",
    );
  }
  if (compiled.features.turns) {
    result.warnings.push("Story uses TURNS or TURNS_SINCE, so fewer states can be merged as duplicates.");
  }

  const registry = new Map<string, Arrival>();
  for (const seed of seeds) {
    new Explorer(compiled, options, seed, registry, result).run();
    if (result.caps.budget) break;
  }

  result.arrivals = [...registry.values()];
  result.complete = !result.caps.budget && result.caps.depth === 0 && Object.keys(result.caps.visits).length === 0;
  return result;
}

class Explorer {
  private story!: Story;
  private readonly opts: Required<Omit<EnumerateOptions, "externals" | "seeds">>;
  private readonly countedFlows: string[];
  private readonly memo = new Map<string, SubResult & { depth: number }>();
  private readonly inProgress = new Set<string>();
  private readonly errors = new Set<string>();

  // Per-segment hook state.
  private committed: TraceStep[] = [];
  private lookahead: TraceStep[] = [];
  private capture: Capture | null = null;
  private stepsThisContinue = 0;

  constructor(
    private readonly compiled: CompiledStory,
    private readonly options: EnumerateOptions,
    private readonly seed: number,
    private readonly registry: Map<string, Arrival>,
    private readonly result: EnumerationResult,
  ) {
    this.opts = { ...DEFAULTS, ...stripUndefined(options), target: options.target };
    this.countedFlows = [...compiled.flows.values()].filter((f) => f.kind !== "function").map((f) => f.path);
  }

  run(): void {
    this.story = this.createStory();
    this.explore(null, 0);
    for (const error of this.errors) this.result.warnings.push(`Runtime (seed ${this.seed}): ${error}`);
  }

  private createStory(): Story {
    const story = new Story(this.compiled.json);
    story.state.storySeed = this.seed;
    story.allowExternalFunctionFallbacks = true;
    story.onError = (message) => this.errors.add(message);

    for (const name of this.compiled.externals) {
      const stub = this.options.externals?.[name];
      if (stub) {
        story.BindExternalFunction(name, stub, true);
      } else if (!this.compiled.flows.has(name)) {
        story.BindExternalFunction(name, () => 0, true);
        const warning = `EXTERNAL ${name} has no stub or ink fallback; it returns 0 during exploration.`;
        if (!this.result.warnings.includes(warning)) this.result.warnings.push(warning);
      }
    }

    this.installHooks(story);
    return story;
  }

  /**
   * Hook the runtime so we see every container entry as it happens, mid-Continue.
   * Continue() looks ahead past a newline and may roll that work back, so entries
   * made during lookahead are held until the runtime commits or discards them.
   */
  private installHooks(story: Story): void {
    const s = story as any;
    const step = s.Step;
    const visitContainer = s.VisitContainer;
    const restoreSnapshot = s.RestoreStateSnapshot;
    const discardSnapshot = s.DiscardSnapshot;
    const counted = new Set(this.countedFlows);

    // A knot that diverts to itself never re-enters a container, so count raw steps.
    s.Step = () => {
      if (++this.stepsThisContinue > MAX_STEPS_PER_CONTINUE) throw new RunawayLoop();
      return step.call(s);
    };
    s.VisitContainer = (container: any, atStart: boolean) => {
      const path: string = container.path.toString();
      if (path === this.opts.target && !this.capture) {
        this.capture = this.captureState(s, [...this.committed, ...this.lookahead]);
      } else if (counted.has(path)) {
        const inLookahead = s._stateSnapshotAtLastNewline !== null;
        (inLookahead ? this.lookahead : this.committed).push({ kind: "knot", path });
      }
      return visitContainer.call(s, container, atStart);
    };
    s.RestoreStateSnapshot = () => {
      this.lookahead = [];
      return restoreSnapshot.call(s);
    };
    s.DiscardSnapshot = () => {
      this.committed.push(...this.lookahead);
      this.lookahead = [];
      return discardSnapshot.call(s);
    };
  }

  private captureState(s: any, steps: TraceStep[]): Capture {
    const variables: Record<string, InkValue> = {};
    for (const name of this.compiled.globals) variables[name] = toPlain(s.variablesState.$(name));

    const visits: Record<string, number> = {};
    for (const path of this.countedFlows) {
      const count = s.state.VisitCountAtPathString(path) ?? 0;
      if (count > 0) visits[path] = count;
    }

    // Text already output in this Continue call, before the target's own content.
    for (const line of splitLines(s.state.currentText)) steps.push({ kind: "line", text: line });
    return { variables, visits, steps };
  }

  /** Run until the next choice point, the end, or the target. */
  private runSegment(): { steps: TraceStep[]; capture: Capture | null; abandoned: boolean } {
    this.committed = [];
    this.lookahead = [];
    this.capture = null;
    try {
      while (this.story.canContinue) {
        this.stepsThisContinue = 0;
        const text = this.story.Continue();
        if (this.capture) break;
        const tags = this.story.currentTags ?? [];
        for (const line of splitLines(text)) {
          this.committed.push(tags.length > 0 ? { kind: "line", text: line, tags: [...tags] } : { kind: "line", text: line });
        }
      }
    } catch (err) {
      if (!(err instanceof RunawayLoop)) throw err;
      this.errors.add("Content loops without offering a choice; path abandoned.");
      this.story = this.createStory();
      return { steps: this.committed, capture: null, abandoned: true };
    }
    return { steps: this.committed, capture: this.capture, abandoned: false };
  }

  private explore(prefix: Prefix | null, depth: number): SubResult {
    const { steps, capture, abandoned } = this.runSegment();
    if (abandoned) return empty();

    if (capture) {
      const key = stableStringify({ variables: capture.variables, visits: capture.visits });
      this.register(key, capture, 1, () => [...unwindPrefix(prefix), ...capture.steps]);
      return { reachable: new Map([[key, { count: 1, suffix: { steps: capture.steps, next: null } }]]), truncated: false };
    }

    const choices = this.story.currentChoices.map((c) => c.text);
    if (choices.length === 0) {
      this.result.stats.endings++;
      return empty();
    }

    const here = this.story.state.ToJson();
    const saved = JSON.parse(here);
    const key = hash(this.stateKey(saved));

    const seen = this.memo.get(key);
    if (seen && !(seen.truncated && depth < seen.depth)) {
      this.result.stats.duplicateStates++;
      for (const [arrivalKey, entry] of seen.reachable) {
        this.register(arrivalKey, null, entry.count, () => [
          ...unwindPrefix(prefix),
          ...steps,
          ...unwindSuffix(entry.suffix),
        ]);
      }
      return { reachable: prepend(steps, seen.reachable), truncated: seen.truncated };
    }
    if (this.inProgress.has(key)) return empty();

    // Check every counted container, not just knots: a knot that diverts to itself
    // does not bump its own count, but the choice or gather it loops through does.
    for (const [path, count] of Object.entries<number>(saved.visitCounts)) {
      if (path !== "" && count > this.opts.maxVisitsPerKnot) {
        const owner = this.owningFlow(path);
        this.result.caps.visits[owner] = (this.result.caps.visits[owner] ?? 0) + 1;
        return empty();
      }
    }
    if (depth >= this.opts.maxDepth) {
      this.result.caps.depth++;
      return { reachable: new Map(), truncated: true };
    }
    if (this.result.stats.choicePoints >= this.opts.maxChoicePoints) {
      this.result.caps.budget = true;
      return { reachable: new Map(), truncated: true };
    }
    this.result.stats.choicePoints++;

    this.inProgress.add(key);
    const node: Prefix = { steps, parent: prefix };
    const reachable: Reachable = new Map();
    let truncated = false;

    for (let i = 0; i < choices.length; i++) {
      this.story.state.LoadJson(here);
      this.story.ChooseChoiceIndex(i);
      const choice: TraceStep = { kind: "choice", index: i, text: choices[i] };
      const sub = this.explore({ steps: [choice], parent: node }, depth + 1);
      truncated ||= sub.truncated;
      for (const [arrivalKey, entry] of sub.reachable) {
        const existing = reachable.get(arrivalKey);
        if (existing) existing.count += entry.count;
        else reachable.set(arrivalKey, { count: entry.count, suffix: { steps: [choice], next: entry.suffix } });
      }
      if (this.result.caps.budget) break;
    }

    this.inProgress.delete(key);
    if (!this.result.caps.budget) this.memo.set(key, { reachable, truncated, depth });
    return { reachable: prepend(steps, reachable), truncated };
  }

  /** "waiting.0.c-0" -> "waiting"; "campfire.late.0" -> "campfire.late". */
  private owningFlow(containerPath: string): string {
    const parts = containerPath.split(".");
    for (let n = parts.length; n > 0; n--) {
      const candidate = parts.slice(0, n).join(".");
      if (this.compiled.flows.has(candidate)) return candidate;
    }
    return containerPath;
  }

  private register(key: string, capture: Capture | null, count: number, trace: () => TraceStep[]): void {
    let arrival = this.registry.get(key);
    if (!arrival) {
      if (!capture) throw new Error("Internal error: memoized arrival missing from registry");
      arrival = { key, variables: capture.variables, visits: capture.visits, pathCount: 0, examples: [], seeds: [] };
      this.registry.set(key, arrival);
    }
    arrival.pathCount += count;
    if (!arrival.seeds.includes(this.seed)) arrival.seeds.push(this.seed);
    if (arrival.examples.length < this.opts.maxExamples) arrival.examples.push(trace());
    this.result.stats.pathsToTarget += count;
  }

  /**
   * Everything about a saved state that can affect what happens next, without
   * bookkeeping that differs between equivalent paths (output text, thread ids,
   * turn indices unless the story reads them).
   */
  private stateKey(state: any): string {
    const flows: Record<string, unknown> = {};
    for (const [name, flow] of Object.entries<any>(state.flows)) {
      flows[name] = {
        callstack: flow.callstack.threads.map((t: any) => t.callstack),
        choices: (flow.currentChoices ?? []).map((c: any) => [
          c.text,
          c.targetPath,
          c.originalChoicePath,
          c.isInvisibleDefault,
          c.tags ?? null,
          flow.choiceThreads?.[c.originalThreadIndex]?.callstack ?? null,
        ]),
      };
    }
    return stableStringify({
      flows,
      currentFlow: state.currentFlowName,
      variables: state.variablesState,
      evalStack: state.evalStack,
      visits: state.visitCounts,
      turns: this.compiled.features.turns ? [state.turnIdx, state.turnIndices] : null,
      random: [state.storySeed, state.previousRandom],
    });
  }
}

function empty(): SubResult {
  return { reachable: new Map(), truncated: false };
}

function prepend(steps: TraceStep[], reachable: Reachable): Reachable {
  if (steps.length === 0) return reachable;
  const out: Reachable = new Map();
  for (const [key, entry] of reachable) out.set(key, { count: entry.count, suffix: { steps, next: entry.suffix } });
  return out;
}

function unwindPrefix(prefix: Prefix | null): TraceStep[] {
  const chunks: TraceStep[][] = [];
  for (let p = prefix; p; p = p.parent) chunks.push(p.steps);
  return chunks.reverse().flat();
}

function unwindSuffix(suffix: Suffix | null): TraceStep[] {
  const out: TraceStep[] = [];
  for (let s = suffix; s; s = s.next) out.push(...s.steps);
  return out;
}

function splitLines(text: string | null): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function toPlain(value: unknown): InkValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") return value;
  if (value instanceof InkList) return value.orderedItems.map((kv) => kv.Key.fullName).sort();
  return String(value);
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}
