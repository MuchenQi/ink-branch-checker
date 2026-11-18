import { scanSource } from "./source";

/** A line of dialogue attributed to a speaker. */
export interface DialogueLine {
  speaker: string;
  /** What the character says, without the speaker prefix, tags, or diverts. */
  text: string;
  file: string;
  /** 1-based line number in `file`. */
  line: number;
  flow: string | null;
  /** True if the line still contains inline ink logic such as {a|b}. */
  dynamic: boolean;
}

export interface ExtractOptions {
  /** File name recorded on each line. Default "main.ink". */
  file?: string;
  /** Tag that names the speaker, e.g. "speaker" for `#speaker: Mara`. Default "speaker". */
  speakerTag?: string;
}

const SKIP_PREFIXES = ["~", "VAR ", "CONST ", "LIST ", "INCLUDE ", "EXTERNAL ", "=", "->", "<-", "}", "{", "TODO"];
/** "Mara: text", "MARA: text", "Captain Reyes: text". Up to three capitalized words. */
const SPEAKER_PREFIX = /^([A-Z][\w'’.-]*(?:\s+[A-Z][\w'’.-]*){0,2})\s*:\s*(\S.*)$/;

/**
 * Pull speaker-attributed lines out of Ink source. A speaker is either a
 * `Name:` prefix or a speaker tag. Lines inside multi-line logic blocks are
 * read too, since `{ cond:` and `- else:` are skipped but their branches are not.
 */
export function extractDialogue(source: string, options: ExtractOptions = {}): DialogueLine[] {
  const file = options.file ?? "main.ink";
  const speakerTag = (options.speakerTag ?? "speaker").toLowerCase();
  const out: DialogueLine[] = [];

  for (const { line, flow, text } of scanSource(source)) {
    const parsed = parseLine(text, speakerTag);
    if (parsed) out.push({ ...parsed, file, line, flow, dynamic: /[{}]/.test(parsed.text) });
  }
  return out;
}

function parseLine(raw: string, speakerTag: string): { speaker: string; text: string } | null {
  let text = raw;
  if (!text || startsWithAny(text, SKIP_PREFIXES)) return null;

  // Weave markers: choices (* +) and gathers (-), possibly nested, then an optional label.
  const marker = /^((?:[*+]|-(?!>))\s*)+/.exec(text);
  const isChoice = marker !== null && /[*+]/.test(marker[0]);
  if (marker) text = text.slice(marker[0].length);
  text = text.replace(/^\(\w+\)\s*/, "");
  if (isChoice) {
    // Choice conditions, then drop the [choice-only] text: the output is what is left.
    while (/^\{[^}]*\}\s*/.test(text)) text = text.replace(/^\{[^}]*\}\s*/, "");
    text = text.replace(/\[[^\]]*\]/, "");
  }
  text = text.trim();
  if (!text || startsWithAny(text, SKIP_PREFIXES) || text.endsWith(":")) return null;

  // Tags run from the first unescaped # to the end of the line.
  const tagStart = text.search(/(?<!\\)#/);
  const tags = tagStart >= 0 ? text.slice(tagStart + 1).split("#").map((t) => t.trim()) : [];
  if (tagStart >= 0) text = text.slice(0, tagStart);

  text = text.replace(/\s*(->|<-).*$/, "").replace(/<>/g, "").trim();
  if (!text) return null;

  for (const tag of tags) {
    const [name, ...value] = tag.split(":");
    if (name.trim().toLowerCase() === speakerTag && value.join(":").trim()) {
      return { speaker: value.join(":").trim(), text };
    }
  }

  const match = SPEAKER_PREFIX.exec(text);
  if (!match || match[1] === "TODO") return null;
  return { speaker: match[1], text: match[2].trim() };
}

function startsWithAny(text: string, prefixes: string[]): boolean {
  return prefixes.some((p) => text.startsWith(p));
}
