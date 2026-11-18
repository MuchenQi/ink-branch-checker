/** One line of Ink source with comments removed and the flow it sits in. */
export interface SourceLine {
  /** 1-based line number. */
  line: number;
  /** Knot or "knot.stitch" the line belongs to, or null before the first knot. */
  flow: string | null;
  /** The line with comments removed and surrounding whitespace trimmed. */
  text: string;
}

const KNOT_HEADER = /^={2,}\s*(?:function\s+)?(\w+)/;
const STITCH_HEADER = /^=\s*(\w+)/;

/**
 * Split Ink source into lines, track which knot or stitch each line is in, and
 * strip comments the way the Ink compiler does (// to end of line, and /* *\/).
 */
export function scanSource(source: string): SourceLine[] {
  const out: SourceLine[] = [];
  let knot: string | null = null;
  let flow: string | null = null;
  let inBlockComment = false;

  source.split(/\r?\n/).forEach((rawLine, index) => {
    let text = "";
    let rest = rawLine;
    while (rest.length > 0) {
      if (inBlockComment) {
        const end = rest.indexOf("*/");
        if (end < 0) {
          rest = "";
        } else {
          rest = rest.slice(end + 2);
          inBlockComment = false;
        }
        continue;
      }
      const lineComment = rest.indexOf("//");
      const blockComment = rest.indexOf("/*");
      if (blockComment >= 0 && (lineComment < 0 || blockComment < lineComment)) {
        text += rest.slice(0, blockComment);
        rest = rest.slice(blockComment + 2);
        inBlockComment = true;
      } else if (lineComment >= 0) {
        text += rest.slice(0, lineComment);
        rest = "";
      } else {
        text += rest;
        rest = "";
      }
    }
    text = text.trim();

    const knotMatch = KNOT_HEADER.exec(text);
    if (knotMatch) {
      knot = knotMatch[1];
      flow = knot;
    } else {
      const stitchMatch = STITCH_HEADER.exec(text);
      if (stitchMatch && knot) flow = `${knot}.${stitchMatch[1]}`;
    }
    out.push({ line: index + 1, flow, text });
  });
  return out;
}

/** The knot or stitch enclosing a 1-based line number, or null outside any knot. */
export function flowAtLine(source: string, line: number): string | null {
  return scanSource(source)[line - 1]?.flow ?? null;
}

/** True if `flow` is `scene` itself or one of its stitches. */
export function isInFlow(flow: string | null, scene: string): boolean {
  return flow !== null && (flow === scene || flow.startsWith(`${scene}.`));
}

/**
 * The writer's notes on story variables: a `//` comment at the end of a VAR,
 * CONST, or LIST line, or comment lines directly above it.
 *
 *     VAR odile_trust = 0 // -2 hostile, 0 neutral, 2 trusts you
 */
export function variableNotes(source: string): Record<string, string> {
  const lines = source.split(/\r?\n/);
  const notes: Record<string, string> = {};
  lines.forEach((line, i) => {
    const decl = /^\s*(?:VAR|CONST|LIST)\s+(\w+)/.exec(line);
    if (!decl) return;
    const parts: string[] = [];
    for (let j = i - 1; j >= 0; j--) {
      const above = /^\s*\/\/\s?(.*)$/.exec(lines[j]);
      if (!above) break;
      parts.unshift(above[1].trim());
    }
    const trailing = /\/\/\s?(.*)$/.exec(line);
    if (trailing) parts.push(trailing[1].trim());
    const note = parts.filter(Boolean).join(" ");
    if (note) notes[decl[1]] = note;
  });
  return notes;
}
