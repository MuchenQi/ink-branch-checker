import { VOICE_TASK, type ReviewTask, type ScenePrompt, type StatePrompt } from "./prompt";

export type FlagKind = "voice" | "stance" | "fact";
export type Severity = "high" | "medium" | "low";

/** One flag as the model returns it, from one review request. */
export interface RawFlag {
  line: number;
  kind: FlagKind;
  severity: Severity;
  speaker: string;
  quote: string;
  problem: string;
  evidence: string;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface ReviewResponse {
  flags: RawFlag[];
  usage?: Usage;
}

/** Runs one review request. The Claude implementation is in claude.ts. */
export interface Reviewer {
  review(scene: ScenePrompt, task: ReviewTask): Promise<ReviewResponse>;
}

/** Which request a result came from: null for the scene-wide voice pass, else the 0-based state index. */
export type TaskRef = number | null;

/** A problem on one line. Voice is judged once per scene; stance and fact are merged across states. */
export interface SceneFlag {
  file: string;
  line: number;
  kind: FlagKind;
  /** "scene" for voice flags, "states" for stance and fact flags. */
  scope: "scene" | "states";
  /** Highest severity across findings. */
  severity: Severity;
  speaker: string;
  quote: string;
  /** One finding from the voice pass, or one per incoming state that raised the flag. */
  findings: { state: TaskRef; severity: Severity; problem: string; evidence: string; seenIn: number }[];
  /** True for voice flags, and for stance or fact flags raised in a majority of runs for every checked state. */
  allStates: boolean;
  /** Runs in which this flag appeared at all, out of `runs`. */
  seenIn: number;
  runs: number;
}

export interface CheckResult {
  scene: string;
  flags: SceneFlag[];
  /** How many times every request was repeated. */
  runs: number;
  voiceChecked: boolean;
  statesChecked: number;
  /** Flags whose line and quote could not be found in the scene. */
  unplaced: { task: TaskRef; run: number; flag: RawFlag }[];
  /** Flags of a kind the task did not ask for, e.g. voice from a state review. Not shown. */
  ignored: { task: TaskRef; run: number; flag: RawFlag }[];
  errors: { task: TaskRef; run: number; message: string }[];
  usage: Usage;
}

export interface CheckOptions {
  /** Parallel requests after the first. Default 4. */
  concurrency?: number;
  /** Run the scene-wide voice pass. Default true. */
  voice?: boolean;
  /**
   * Run every request this many times and report how often each flag recurs.
   * Real problems tend to recur; spurious flags tend not to. Default 1.
   */
  repeat?: number;
}

const SEVERITY_RANK: Record<Severity, number> = { low: 0, medium: 1, high: 2 };

/**
 * Run the voice pass once for the scene, then review stance and fact for every
 * incoming state, and merge the flags by line. The first request runs alone so
 * it writes the shared scene prompt to the cache before the others read it.
 * With `repeat`, every request runs that many times and flags carry counts.
 */
export async function checkScene(
  scene: ScenePrompt,
  states: StatePrompt[],
  reviewer: Reviewer,
  options: CheckOptions = {},
): Promise<CheckResult> {
  const concurrency = Math.max(1, options.concurrency ?? 4);
  const runs = Math.max(1, Math.floor(options.repeat ?? 1));
  const tasks: ReviewTask[] = [...(options.voice === false ? [] : [VOICE_TASK]), ...states];
  const jobs = Array.from({ length: runs }, (_, run) => tasks.map((task) => ({ run, task }))).flat();
  const responses: (ReviewResponse | null)[] = new Array(jobs.length).fill(null);
  const errors: CheckResult["errors"] = [];

  const execute = async (i: number) => {
    const { run, task } = jobs[i];
    try {
      responses[i] = await reviewer.review(scene, task);
    } catch (err) {
      errors.push({ task: refOf(task), run, message: err instanceof Error ? err.message : String(err) });
    }
  };

  if (jobs.length > 0) await execute(0);
  let next = 1;
  const workers = Array.from({ length: Math.min(concurrency, jobs.length - 1) }, async () => {
    while (next < jobs.length) await execute(next++);
  });
  await Promise.all(workers);

  const usage: Usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
  const merged = new Map<string, { flag: SceneFlag; runsSeen: Set<number>; stateRuns: Map<TaskRef, Set<number>> }>();
  const succeeded = new Map<TaskRef, number>();
  const unplaced: CheckResult["unplaced"] = [];
  const ignored: CheckResult["ignored"] = [];

  responses.forEach((response, i) => {
    if (!response) return;
    const { run, task } = jobs[i];
    const ref = refOf(task);
    succeeded.set(ref, (succeeded.get(ref) ?? 0) + 1);
    if (response.usage) {
      usage.inputTokens += response.usage.inputTokens;
      usage.outputTokens += response.usage.outputTokens;
      usage.cacheReadTokens += response.usage.cacheReadTokens;
      usage.cacheWriteTokens += response.usage.cacheWriteTokens;
    }

    for (const raw of response.flags) {
      if ((raw.kind === "voice") !== (task.type === "voice")) {
        ignored.push({ task: ref, run, flag: raw });
        continue;
      }
      const line = placeFlag(scene, raw);
      if (line === null) {
        unplaced.push({ task: ref, run, flag: raw });
        continue;
      }
      const key = `${line}|${raw.kind}`;
      let entry = merged.get(key);
      if (!entry) {
        entry = {
          flag: {
            file: scene.file,
            line,
            kind: raw.kind,
            scope: raw.kind === "voice" ? "scene" : "states",
            severity: raw.severity,
            speaker: raw.speaker,
            quote: raw.quote,
            findings: [],
            allStates: false,
            seenIn: 0,
            runs,
          },
          runsSeen: new Set(),
          stateRuns: new Map(),
        };
        merged.set(key, entry);
      }
      const { flag } = entry;
      if (SEVERITY_RANK[raw.severity] > SEVERITY_RANK[flag.severity]) flag.severity = raw.severity;
      entry.runsSeen.add(run);

      let seen = entry.stateRuns.get(ref);
      if (!seen) entry.stateRuns.set(ref, (seen = new Set()));
      if (seen.has(run)) continue; // Same line flagged twice in one response.
      seen.add(run);
      const finding = flag.findings.find((f) => f.state === ref);
      if (finding) {
        finding.seenIn = seen.size;
        if (SEVERITY_RANK[raw.severity] > SEVERITY_RANK[finding.severity]) finding.severity = raw.severity;
      } else {
        flag.findings.push({ state: ref, severity: raw.severity, problem: raw.problem, evidence: raw.evidence, seenIn: 1 });
      }
    }
  });

  const checkedStates = states.filter((s) => (succeeded.get(s.index) ?? 0) > 0);
  const flags = [...merged.values()].map(({ flag, runsSeen }) => {
    flag.seenIn = runsSeen.size;
    flag.findings.sort((a, b) => (a.state ?? -1) - (b.state ?? -1));
    if (flag.scope === "scene") {
      flag.allStates = true;
    } else {
      const majority = (state: number) => {
        const finding = flag.findings.find((f) => f.state === state);
        return finding !== undefined && finding.seenIn * 2 > (succeeded.get(state) ?? 0);
      };
      flag.allStates = checkedStates.length > 0 && checkedStates.every((s) => majority(s.index));
    }
    return flag;
  });
  flags.sort((a, b) => a.line - b.line || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);

  errors.sort((a, b) => a.run - b.run || (a.task ?? -1) - (b.task ?? -1));
  return {
    scene: scene.scene,
    flags,
    runs,
    voiceChecked: (succeeded.get(null) ?? 0) > 0,
    statesChecked: checkedStates.length,
    unplaced,
    ignored,
    errors,
    usage,
  };
}

const KIND_ORDER: Record<FlagKind, number> = { voice: 0, stance: 1, fact: 2 };

function refOf(task: ReviewTask): TaskRef {
  return task.type === "voice" ? null : task.index;
}

/** Trust the line number if it is in the scene; otherwise look for the quote. */
function placeFlag(scene: ScenePrompt, flag: RawFlag): number | null {
  if (scene.lines.some((l) => l.line === flag.line)) return flag.line;
  const quote = flag.quote.trim();
  if (!quote) return null;
  return scene.lines.find((l) => l.text.includes(quote))?.line ?? null;
}

/** Check a parsed model response against the review schema. */
export function parseReview(value: unknown): RawFlag[] {
  if (!isObject(value) || !Array.isArray(value.flags)) throw new Error("Review is missing a flags array");
  return value.flags.map((f, i) => {
    if (
      !isObject(f) ||
      typeof f.line !== "number" ||
      !(f.kind === "voice" || f.kind === "stance" || f.kind === "fact") ||
      !(typeof f.severity === "string" && f.severity in SEVERITY_RANK) ||
      typeof f.quote !== "string" ||
      typeof f.problem !== "string" ||
      typeof f.evidence !== "string"
    ) {
      throw new Error(`Review flag ${i} does not match the schema`);
    }
    return {
      line: f.line,
      kind: f.kind,
      severity: f.severity as Severity,
      speaker: typeof f.speaker === "string" ? f.speaker : "",
      quote: f.quote,
      problem: f.problem,
      evidence: f.evidence,
    };
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}
