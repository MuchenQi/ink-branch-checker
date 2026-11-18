/** Writer-provided voice rules for one character. */
export interface StyleSheet {
  character: string;
  aliases: string[];
  /** Free-text rules. May mention story state ("colder when mara_trust < 3"). */
  rules: string[];
  /** Example lines written by the writer, from `>` quotes. */
  examples: string[];
}

export interface StyleSheets {
  characters: StyleSheet[];
  /** Rules written before the first heading, applying to everyone. */
  general: string[];
}

/**
 * Parse a Markdown style sheet:
 *
 *     # Mara
 *     Aliases: MARA, the thief
 *     - Short, clipped sentences.
 *     - Never apologises.
 *     > Wrong face, friend. Happens all the time.
 *
 * Each heading starts a character. Bullets and plain paragraphs are rules,
 * `>` lines are example lines, and `Aliases:` lists other speaker names.
 */
export function parseStyleSheets(markdown: string): StyleSheets {
  const characters: StyleSheet[] = [];
  const general: string[] = [];
  let current: StyleSheet | null = null;
  // The rule a continuation line should extend, or null after a blank line.
  let openRule: { list: string[]; index: number } | null = null;

  const rules = () => (current ? current.rules : general);

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      openRule = null;
      continue;
    }

    const heading = /^#{1,6}\s+(.+?)\s*#*$/.exec(line);
    if (heading) {
      current = { character: heading[1], aliases: [], rules: [], examples: [] };
      characters.push(current);
      openRule = null;
      continue;
    }

    const aliases = /^(?:aliases|also called)\s*:\s*(.*)$/i.exec(line);
    if (aliases && current) {
      current.aliases.push(...aliases[1].split(",").map((a) => a.trim()).filter(Boolean));
      openRule = null;
      continue;
    }

    const quote = /^>\s*(.*)$/.exec(line);
    if (quote) {
      const example = stripQuotes(quote[1]);
      if (example && current) current.examples.push(example);
      else if (example) general.push(example);
      openRule = null;
      continue;
    }

    const bullet = /^(?:[-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (bullet) {
      const list = rules();
      list.push(bullet[1]);
      openRule = { list, index: list.length - 1 };
      continue;
    }

    if (openRule) {
      openRule.list[openRule.index] += ` ${line}`;
    } else {
      const list = rules();
      list.push(line);
      openRule = { list, index: list.length - 1 };
    }
  }

  return { characters, general };
}

function stripQuotes(text: string): string {
  return text.trim().replace(/^["“](.*)["”]$/, "$1").trim();
}

/**
 * Add a rule to a character's section of a style sheet, matching the heading
 * or an alias case-insensitively. Appends a new section if there is none.
 * Returns the new text and the 0-based line of the inserted rule.
 */
export function addStyleRule(markdown: string, character: string, rule: string): { text: string; line: number } {
  const bullet = `- ${rule.replace(/\s+/g, " ").trim()}`;
  const lines = markdown.length > 0 ? markdown.split(/\r?\n/) : [];
  const eol = markdown.includes("\r\n") ? "\r\n" : "\n";
  const wanted = character.trim().toLowerCase();

  const headings = lines.flatMap((text, i) => {
    const m = /^#{1,6}\s+(.+?)\s*#*$/.exec(text.trim());
    return m ? [{ i, name: m[1] }] : [];
  });
  for (let h = 0; h < headings.length; h++) {
    const start = headings[h].i;
    const end = h + 1 < headings.length ? headings[h + 1].i : lines.length;
    const names = [headings[h].name];
    for (let i = start + 1; i < end; i++) {
      const aliases = /^(?:aliases|also called)\s*:\s*(.*)$/i.exec(lines[i].trim());
      if (aliases) names.push(...aliases[1].split(","));
    }
    if (!names.some((n) => n.trim().toLowerCase() === wanted)) continue;

    // After the section's last non-blank line.
    let at = end;
    while (at > start + 1 && lines[at - 1].trim() === "") at--;
    lines.splice(at, 0, bullet);
    return { text: lines.join(eol), line: at };
  }

  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  if (lines.length > 0) lines.push("");
  lines.push(`# ${character.trim()}`, bullet, "");
  return { text: lines.join(eol), line: lines.length - 2 };
}
