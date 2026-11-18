import type { CompiledStory } from "./compile";
import type { Dependencies } from "./dependencies";
import type { Arrival, EnumerationResult, InkValue, TraceStep } from "./enumerate";
import { stableStringify } from "./util";

export interface GroupOptions {
  /** Output of findDependencies for the same target. */
  dependencies: Dependencies;
  /** Extra variables or knot/stitch paths the writer wants to distinguish states by. */
  pin?: string[];
  /** Characters in the scene. Variables whose names mention them count as relevant (e.g. "Mara" -> mara_trust). */
  characters?: string[];
  /** Example traces kept per group, shortest first. Default 3. */
  maxExamples?: number;
  /**
   * Keep every distinct combination of variable values as its own state when
   * there are at most this many. Drafts often state facts in plain prose that the
   * scene's logic never reads, so merging by dependencies alone can hide them.
   * Above this, states are merged by what the scene reads. Default 10; 0 always merges.
   */
  keepAllUpTo?: number;
}

export interface StateGroup {
  key: string;
  /** Values of the relevant variables in this group. */
  variables: Record<string, InkValue>;
  /** Visit counts of the relevant knots in this group (0 if never visited). */
  visits: Record<string, number>;
  /** The raw arrivals merged into this group. They differ only in irrelevant state. */
  arrivals: Arrival[];
  pathCount: number;
  examples: TraceStep[][];
}

export interface Grouping {
  /** "all": every variable distinguishes states. "dependencies": only what the scene reads, pins, and character variables. */
  mode: "all" | "dependencies";
  relevant: { variables: string[]; visits: string[] };
  /** Pinned names that are neither a global variable nor a knot or stitch. */
  unknownPins: string[];
  groups: StateGroup[];
}

/** Reduce arrivals to the distinct states that matter to the scene. */
export function groupArrivals(compiled: CompiledStory, result: EnumerationResult, options: GroupOptions): Grouping {
  const variables = new Set(options.dependencies.variables);
  const visits = new Set(options.dependencies.visits);
  const unknownPins: string[] = [];

  for (const name of options.pin ?? []) {
    if (compiled.globals.includes(name)) variables.add(name);
    else if (compiled.flows.has(name)) visits.add(name);
    else unknownPins.push(name);
  }

  const characters = (options.characters ?? []).map((c) => c.toLowerCase());
  for (const name of compiled.globals) {
    if (nameTokens(name).some((token) => characters.includes(token))) variables.add(name);
  }

  const byDependencies = { variables: [...variables].sort(), visits: [...visits].sort() };
  const byAll = { variables: [...compiled.globals].sort(), visits: byDependencies.visits };
  const keepAllUpTo = options.keepAllUpTo ?? 10;
  const maxExamples = options.maxExamples ?? 3;

  if (keepAllUpTo > 0) {
    const groups = bucket(result.arrivals, byAll, maxExamples);
    if (groups.length <= keepAllUpTo) return { mode: "all", relevant: byAll, unknownPins, groups };
  }
  return {
    mode: "dependencies",
    relevant: byDependencies,
    unknownPins,
    groups: bucket(result.arrivals, byDependencies, maxExamples),
  };
}

function bucket(
  arrivals: Arrival[],
  relevant: { variables: string[]; visits: string[] },
  maxExamples: number,
): StateGroup[] {
  const groups = new Map<string, StateGroup>();

  for (const arrival of arrivals) {
    const vars = Object.fromEntries(relevant.variables.map((v) => [v, arrival.variables[v] ?? null]));
    const counts = Object.fromEntries(relevant.visits.map((k) => [k, arrival.visits[k] ?? 0]));
    const key = stableStringify({ variables: vars, visits: counts });

    let group = groups.get(key);
    if (!group) {
      group = { key, variables: vars, visits: counts, arrivals: [], pathCount: 0, examples: [] };
      groups.set(key, group);
    }
    group.arrivals.push(arrival);
    group.pathCount += arrival.pathCount;
    group.examples.push(...arrival.examples);
  }

  // Shortest paths first: they show the essential history with the least noise.
  for (const group of groups.values()) {
    group.examples = group.examples
      .map((trace, order) => ({ trace, order }))
      .sort((a, b) => a.trace.length - b.trace.length || a.order - b.order)
      .slice(0, maxExamples)
      .map((e) => e.trace);
  }

  return [...groups.values()];
}

/** "mara_trust" -> ["mara", "trust"], "maraTrust" -> ["mara", "trust"]. */
function nameTokens(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}
