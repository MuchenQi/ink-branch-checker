import type { DialogueLine } from "./dialogue";
import { isInFlow, scanSource } from "./source";
import type { StyleSheets } from "./stylesheet";

/**
 * Everything the checker knows about how one character speaks. The style
 * sheet is the writer's declaration of the persona; sample lines are pulled
 * from the script as a convenience and are not persona inference.
 */
export interface VoiceProfile {
  character: string;
  /** True if the writer declared a style sheet for this character. */
  declared: boolean;
  /** Every speaker name that maps to this character. */
  aliases: string[];
  /** From the style sheet, if any. */
  rules: string[];
  /** Writer-provided example lines from the style sheet. */
  examples: string[];
  /** Lines from the script, spread across scenes, in source order. */
  samples: DialogueLine[];
  /** Lines available for this character outside the excluded scene. */
  totalLines: number;
}

export interface ProfileOptions {
  styleSheets?: StyleSheets;
  /** Scene being checked. Its lines (and its stitches' lines) are never used as samples. */
  exclude?: string;
  /** Only build profiles for these characters (names or aliases). */
  characters?: string[];
  /** Sample lines per character. Default 25. */
  maxSamples?: number;
}

/** Build one profile per character, merging speaker names through style sheet aliases. */
export function buildVoiceProfiles(lines: DialogueLine[], options: ProfileOptions = {}): VoiceProfile[] {
  const maxSamples = options.maxSamples ?? 25;
  const sheets = options.styleSheets?.characters ?? [];

  // Canonical key for every known name. Style sheet names win over script spellings.
  const keyOf = new Map<string, string>();
  for (const sheet of sheets) {
    for (const name of [sheet.character, ...sheet.aliases]) keyOf.set(normalize(name), normalize(sheet.character));
  }
  const canonical = (name: string) => keyOf.get(normalize(name)) ?? normalize(name);

  const byKey = new Map<string, { names: Map<string, number>; lines: { line: DialogueLine; order: number }[] }>();
  const entry = (key: string) => {
    let e = byKey.get(key);
    if (!e) byKey.set(key, (e = { names: new Map(), lines: [] }));
    return e;
  };
  lines.forEach((line, order) => {
    const e = entry(canonical(line.speaker));
    e.names.set(line.speaker, (e.names.get(line.speaker) ?? 0) + 1);
    if (!(options.exclude && isInFlow(line.flow, options.exclude))) e.lines.push({ line, order });
  });
  for (const sheet of sheets) entry(normalize(sheet.character));

  const wanted = options.characters ? new Set(options.characters.map(canonical)) : null;
  const profiles: VoiceProfile[] = [];

  for (const [key, e] of byKey) {
    if (wanted && !wanted.has(key)) continue;
    const sheet = sheets.find((s) => normalize(s.character) === key);
    const mostUsed = [...e.names].sort((a, b) => b[1] - a[1])[0]?.[0];
    const aliases = new Set([...e.names.keys(), ...(sheet ? [sheet.character, ...sheet.aliases] : [])]);

    profiles.push({
      character: sheet?.character ?? mostUsed ?? key,
      declared: sheet !== undefined,
      aliases: [...aliases].sort(),
      rules: sheet?.rules ?? [],
      examples: sheet?.examples ?? [],
      samples: pickSamples(e.lines, maxSamples),
      totalLines: e.lines.length,
    });
  }
  return profiles;
}

/** Find the profile for a speaker name, matching aliases case-insensitively. */
export function profileFor(profiles: VoiceProfile[], speaker: string): VoiceProfile | undefined {
  const key = normalize(speaker);
  return profiles.find((p) => p.aliases.some((a) => normalize(a) === key) || normalize(p.character) === key);
}

/** Speakers with lines in a scene (or its stitches), in order of first appearance. */
export function speakersIn(lines: DialogueLine[], scene: string): string[] {
  const seen = new Map<string, string>();
  for (const line of lines) {
    if (isInFlow(line.flow, scene) && !seen.has(normalize(line.speaker))) {
      seen.set(normalize(line.speaker), line.speaker);
    }
  }
  return [...seen.values()];
}

/**
 * Characters with a style sheet whose name or alias appears anywhere in a scene,
 * comments included. Catches characters who have not spoken yet, e.g. in a
 * scene the writer has only outlined.
 */
export function declaredCharactersIn(source: string, scene: string, styleSheets: StyleSheets | undefined): string[] {
  if (!styleSheets) return [];
  const raw = source.split(/\r?\n/);
  const text = scanSource(source)
    .filter((l) => isInFlow(l.flow, scene))
    .map((l) => raw[l.line - 1])
    .join("\n");
  const mentions = (name: string) => new RegExp(`(^|[^\\w])${escapeRegExp(name)}(?!\\w)`, "i").test(text);
  return styleSheets.characters
    .filter((sheet) => [sheet.character, ...sheet.aliases].some(mentions))
    .map((sheet) => sheet.character);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Spread samples across scenes so one chatty scene does not dominate: take
 * the best remaining line from each scene in turn. Clean lines of three or more
 * words go first, then longer lines. The result is in source order so prompts
 * built from it stay stable between runs.
 */
function pickSamples(pool: { line: DialogueLine; order: number }[], max: number): DialogueLine[] {
  const seenText = new Set<string>();
  const byFlow = new Map<string, { line: DialogueLine; order: number }[]>();
  for (const item of pool) {
    const text = normalize(item.line.text);
    if (seenText.has(text)) continue;
    seenText.add(text);
    const flow = item.line.flow ?? "";
    if (!byFlow.has(flow)) byFlow.set(flow, []);
    byFlow.get(flow)!.push(item);
  }

  const score = (l: DialogueLine) => {
    const words = l.text.split(/\s+/).length;
    return (words >= 3 && !l.dynamic ? 1000 : 0) + words;
  };
  const queues = [...byFlow.values()].map((items) =>
    [...items].sort((a, b) => score(b.line) - score(a.line) || a.order - b.order),
  );

  const picked: { line: DialogueLine; order: number }[] = [];
  while (picked.length < max && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && picked.length < max) picked.push(next);
    }
  }
  return picked.sort((a, b) => a.order - b.order).map((p) => p.line);
}

function normalize(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}
