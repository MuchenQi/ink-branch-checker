import type { CompiledStory } from "./compile";
import type { InkValue, TraceStep } from "./enumerate";
import type { Grouping, StateGroup } from "./group";
import { isInFlow, scanSource } from "./source";
import type { StyleSheets } from "./stylesheet";
import type { VoiceProfile } from "./voice";

/**
 * Instructions shared by every check. Kept byte-identical between runs so it
 * stays in the prompt cache.
 */
export const SYSTEM_PROMPT = `You review a writer's draft of a scene in a branching game script written in Ink. The writer is the author and makes every decision. You never rewrite lines or suggest replacement text; you point out possible problems and explain them, and the writer judges whether they agree.

A scene can be reached from several story states. A character can sound right on every single path and still be wrong for one of them; that is what you are here to catch. Each request gives you the draft scene and one task, which is either a voice review of the whole scene or a review of the scene against one incoming state.

Each character's style sheet is declared by the writer and is the authority on how they speak. Lines from elsewhere in the script are reference only. If a character has no style sheet, judge only clear departures from their other lines and flag less.

There are three kinds of problems:
- "voice": how the line is said does not sound like the character. Word choice, sentence length and rhythm, register, verbal habits, things the style sheet says they never or always do. Voice belongs to the character, not to the path, so it is judged once for the whole scene.
- "stance": the character's attitude in the line does not fit what has happened to them on this path. Warmth, coldness, trust, deference, or hostility toward the person they address. A line can fit one incoming state and be wrong in another (warm after a reconciliation, wrong after a betrayal).
- "fact": a line contradicts the incoming state. It mentions something the player does not have, an event that did not happen on this path, or knowledge the character cannot have.

Flag only the kinds the task asks for. Do not flag a character's motivations, decisions, or behaviour, plot logic, pacing, or what the scene should contain. Do not flag style preferences, typos, or lines that are merely plain.

If you conclude a line fits, do not flag it, even if it is unusual. If nothing is wrong, return an empty list. For each flag give the line number shown in the draft, quote the exact words at fault, say what is wrong, and name the evidence: a style rule, a sample line, a variable value, or an event on the path.`;

/** Task block for the single voice pass over a scene. */
export const VOICE_TASK_TEXT = `<task type="voice">
Review the voice of every character line in the draft, including every branch of every conditional, since each branch is shown to some player. Judge each line against the character's style sheet and other lines. Flag only "voice" problems. Stance and facts are checked separately for each incoming state.
</task>`;

/** Task block that precedes each incoming state. */
export const STATE_TASK_TEXT = `<task type="incoming_state">
Review the scene as a player arriving in the incoming state below would read it. Flag only "stance" and "fact" problems; voice is checked separately for the whole scene.
Inline Ink logic like {flag: text|other} or multi-line conditionals means only the branch that would display in this state is seen; judge that branch, and ignore branches that cannot display here. When a variable "varies by path" within this state, a fact problem that depends on it holds only on some paths: say which ones in the problem.
</task>`;

/** Structured output schema for one review request. */
export const REVIEW_SCHEMA = {
  type: "object",
  properties: {
    flags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          line: { type: "integer", description: "Line number as shown in the draft." },
          kind: { type: "string", enum: ["voice", "stance", "fact"] },
          severity: { type: "string", enum: ["high", "medium", "low"] },
          speaker: { type: "string", description: "Character speaking the line, or an empty string for narration." },
          quote: { type: "string", description: "Exact words at fault, copied from the draft." },
          problem: { type: "string", description: "What is wrong, in this incoming state." },
          evidence: { type: "string", description: "The rule, sample line, variable, or path event it conflicts with." },
        },
        required: ["line", "kind", "severity", "speaker", "quote", "problem", "evidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["flags"],
  additionalProperties: false,
} as const;

export interface SceneLine {
  line: number;
  text: string;
}

export interface ScenePrompt {
  scene: string;
  file: string;
  /** Raw source lines of the scene, with their 1-based line numbers. */
  lines: SceneLine[];
  /** Same for every state of one check: the draft and the voices. Cache this. */
  text: string;
}

/** The single voice review of a scene. */
export interface VoiceTask {
  type: "voice";
  text: string;
}

export interface StatePrompt {
  type: "state";
  index: number;
  group: StateGroup;
  text: string;
}

/** What one request asks: the voice pass, or one incoming state. */
export type ReviewTask = VoiceTask | StatePrompt;

export const VOICE_TASK: VoiceTask = { type: "voice", text: VOICE_TASK_TEXT };

export interface PromptOptions {
  /** Example paths shown per state. Default 2. */
  maxPaths?: number;
  /** Most recent trace steps kept per path. Default 40. */
  maxStepsPerPath?: number;
}

/** The draft scene and the voices of the characters who speak in it. */
export function buildScenePrompt(
  source: string,
  scene: string,
  profiles: VoiceProfile[],
  options: { file?: string; styleSheets?: StyleSheets; variableNotes?: Record<string, string> } = {},
): ScenePrompt {
  const file = options.file ?? "main.ink";
  const raw = source.split(/\r?\n/);
  const lines = scanSource(source)
    .filter((l) => isInFlow(l.flow, scene))
    .map((l) => ({ line: l.line, text: raw[l.line - 1] }));
  // Drop trailing blank lines before the next knot.
  while (lines.length > 0 && lines[lines.length - 1].text.trim() === "") lines.pop();

  const width = String(lines.at(-1)?.line ?? 0).length;
  const parts = [
    `<draft scene="${scene}" file="${file}">`,
    ...lines.map((l) => `${String(l.line).padStart(width)} | ${l.text}`),
    `</draft>`,
  ];

  const notes = Object.entries(options.variableNotes ?? {});
  if (notes.length > 0) {
    parts.push(
      "",
      "<variable_notes>",
      "What the writer says the story variables mean:",
      ...notes.map(([name, note]) => `- ${name}: ${note}`),
      "</variable_notes>",
    );
  }

  const general = options.styleSheets?.general ?? [];
  if (general.length > 0) {
    parts.push("", "<general_rules>", ...general.map((r) => `- ${r}`), "</general_rules>");
  }

  for (const profile of profiles) {
    parts.push("", `<voice character="${profile.character}">`);
    const otherNames = profile.aliases.filter((a) => a !== profile.character);
    if (otherNames.length > 0) parts.push(`Also written as: ${otherNames.join(", ")}`);
    if (!profile.declared) parts.push("The writer has not declared a style sheet for this character.");
    if (profile.rules.length > 0) parts.push("Style sheet rules:", ...profile.rules.map((r) => `- ${r}`));
    if (profile.examples.length > 0) parts.push("Style sheet example lines:", ...profile.examples.map((e) => `- ${e}`));
    if (profile.samples.length > 0) {
      parts.push(
        `Lines from elsewhere in the script, for reference (${profile.samples.length} of ${profile.totalLines}):`,
        ...profile.samples.map((s) => `- [${s.flow ?? "top"}] ${s.text}`),
      );
    } else {
      parts.push("No lines for this character elsewhere in the script.");
    }
    parts.push("</voice>");
  }

  return { scene, file, lines, text: parts.join("\n") };
}

/** One incoming state: values, visit counts, and recent history on example paths. */
export function buildStatePrompts(
  compiled: CompiledStory,
  grouping: Grouping,
  options: PromptOptions = {},
): StatePrompt[] {
  const maxPaths = options.maxPaths ?? 2;
  const maxSteps = options.maxStepsPerPath ?? 40;
  const relevant = new Set(grouping.relevant.variables);
  const total = grouping.groups.length;

  return grouping.groups.map((group, i) => {
    const parts = [STATE_TASK_TEXT, `<incoming_state number="${i + 1}" of="${total}" paths="${group.pathCount}">`];

    parts.push("Variables (* = read by the scene or tied to its characters; these define this state):");
    for (const name of compiled.globals) {
      const values = distinct(group.arrivals.map((a) => a.variables[name] ?? null));
      const shown = values.length === 1 ? formatValue(values[0]) : `varies by path: ${values.map(formatValue).join(" | ")}`;
      parts.push(`${relevant.has(name) ? "*" : " "} ${name} = ${shown}`);
    }

    const visited = visitSummary(group);
    if (visited.length > 0) parts.push("Knots visited before this scene:", ...visited.map((v) => `  ${v}`));

    group.examples.slice(0, maxPaths).forEach((trace, p) => {
      const shown = trace.slice(-maxSteps);
      const cut = trace.length - shown.length;
      parts.push(`Path ${p + 1}${cut > 0 ? ` (last ${shown.length} steps)` : ""}:`);
      parts.push(...shown.map(formatStep));
    });
    parts.push("</incoming_state>");

    return { type: "state" as const, index: i, group, text: parts.join("\n") };
  });
}

function visitSummary(group: StateGroup): string[] {
  const counts = new Map<string, number[]>();
  for (const arrival of group.arrivals) {
    for (const [knot, n] of Object.entries(arrival.visits)) {
      if (!counts.has(knot)) counts.set(knot, []);
      counts.get(knot)!.push(n);
    }
  }
  return [...counts].map(([knot, ns]) => {
    const always = ns.length === group.arrivals.length;
    const values = distinct(ns);
    return `${knot}: ${values.join(" or ")} time${values.length === 1 && values[0] === 1 ? "" : "s"}${always ? "" : " (on some paths)"}`;
  });
}

function formatStep(step: TraceStep): string {
  if (step.kind === "knot") return `  [enters ${step.path}]`;
  if (step.kind === "choice") return `  > player chooses: ${step.text}`;
  return `  ${step.text}`;
}

function formatValue(value: InkValue): string {
  if (Array.isArray(value)) return value.length === 0 ? "(empty list)" : `(${value.join(", ")})`;
  return JSON.stringify(value);
}

function distinct<T>(values: T[]): T[] {
  const seen = new Map<string, T>();
  for (const v of values) seen.set(JSON.stringify(v), v);
  return [...seen.values()];
}
