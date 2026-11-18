import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildVoiceProfiles,
  extractDialogue,
  flowAtLine,
  parseStyleSheets,
  profileFor,
  scanSource,
  speakersIn,
} from "../src";

const example = (file: string) => readFileSync(join(__dirname, "../../../examples", file), "utf8");
const betrayal = example("betrayal.ink");

describe("scanSource", () => {
  it("tracks knots and stitches and strips comments", () => {
    const lines = scanSource(["Intro // note", "=== a ===", "/* block", "still */ Hi", "= s", "There"].join("\n"));
    expect(lines.map((l) => [l.flow, l.text])).toEqual([
      [null, "Intro"],
      ["a", "=== a ==="],
      ["a", ""],
      ["a", "Hi"],
      ["a.s", "= s"],
      ["a.s", "There"],
    ]);
  });

  it("finds the flow at a line", () => {
    const line = betrayal.split("\n").findIndex((l) => l.includes("The fire pops")) + 1;
    expect(flowAtLine(betrayal, line)).toBe("campfire");
    expect(flowAtLine(betrayal, 1)).toBeNull();
  });
});

describe("extractDialogue", () => {
  const lines = extractDialogue(betrayal, { file: "betrayal.ink" });

  it("finds speaker lines with location and flow", () => {
    const first = lines.find((l) => l.speaker === "Mara")!;
    expect(first).toMatchObject({ text: "Keep your head down and let me do the talking.", flow: "gate", file: "betrayal.ink" });
    expect(betrayal.split("\n")[first.line - 1]).toContain("Keep your head down");
  });

  it("reads lines inside multi-line conditionals", () => {
    const campfire = lines.filter((l) => l.flow === "campfire").map((l) => l.text);
    expect(campfire).toEqual(["Don't sit so close.", "Sit. You look half dead."]);
  });

  it("ignores narration, choices without a speaker, logic, and diverts", () => {
    expect(lines.every((l) => /^[A-Z]/.test(l.speaker))).toBe(true);
    expect(lines.some((l) => l.text.includes("->"))).toBe(false);
    expect(lines.some((l) => l.text.includes("She's the one you want"))).toBe(false);
    expect(new Set(lines.map((l) => l.speaker))).toEqual(new Set(["Mara", "Guard", "You"]));
  });

  it("handles choices, gathers, labels, tags, glue, and trailing diverts", () => {
    const source = [
      "=== k ===",
      "* {x} [Ask] Mara: What's that? -> next",
      "+ (lbl) [Wait] REYES: Patience. #mood:calm",
      "- Mara: Gather line <>",
      "- -> elsewhere",
      "Not dialogue: this is fine.",
      "Hello there. #speaker: Old Tom",
      "Mara: You {paid: paid|didn't pay}.",
    ].join("\n");
    const found = extractDialogue(source).map((l) => [l.speaker, l.text, l.dynamic]);
    expect(found).toEqual([
      ["Mara", "What's that?", false],
      ["REYES", "Patience.", false],
      ["Mara", "Gather line", false],
      ["Old Tom", "Hello there.", false],
      ["Mara", "You {paid: paid|didn't pay}.", true],
    ]);
  });

  it("supports a custom speaker tag", () => {
    const found = extractDialogue("Hi. #who: Mara", { speakerTag: "who" });
    expect(found).toMatchObject([{ speaker: "Mara", text: "Hi." }]);
  });
});

describe("parseStyleSheets", () => {
  const sheets = parseStyleSheets(example("betrayal.voices.md"));

  it("reads characters, aliases, rules, and examples", () => {
    const mara = sheets.characters.find((c) => c.character === "Mara")!;
    expect(mara.aliases).toEqual(["MARA"]);
    expect(mara.rules).toContain("Never apologises, and mocks other people's apologies.");
    expect(mara.examples).toEqual(["Wrong face, friend. Happens all the time.", "Fine. I'm fine. Keep moving."]);
  });

  it("joins wrapped bullet lines and keeps general rules", () => {
    const mara = sheets.characters.find((c) => c.character === "Mara")!;
    expect(mara.rules.at(-1)).toBe("If betrayed_mara is true she is cold and keeps her distance, but she does not shout.");
    expect(sheets.general).toEqual(["Everyone in this story speaks plainly. No modern slang."]);
  });

  it("strips quotes from examples", () => {
    const parsed = parseStyleSheets('# A\n> "Quoted."\n> “Curly.”');
    expect(parsed.characters[0].examples).toEqual(["Quoted.", "Curly."]);
  });
});

describe("buildVoiceProfiles", () => {
  const lines = extractDialogue(betrayal);
  const styleSheets = parseStyleSheets(example("betrayal.voices.md"));

  it("never samples from the scene being checked", () => {
    const [mara] = buildVoiceProfiles(lines, { exclude: "campfire", characters: ["Mara"] });
    expect(mara.samples.length).toBeGreaterThan(0);
    expect(mara.samples.every((l) => l.flow !== "campfire")).toBe(true);
    expect(mara.totalLines).toBe(lines.filter((l) => l.speaker === "Mara" && l.flow !== "campfire").length);
  });

  it("merges style sheet rules and aliases", () => {
    const source = "=== a ===\nMARA: Loud.\nMara: Quiet one here.\n";
    const [mara] = buildVoiceProfiles(extractDialogue(source), { styleSheets });
    expect(mara.character).toBe("Mara");
    expect(mara.samples).toHaveLength(2);
    expect(mara.rules.length).toBeGreaterThan(0);
    expect(profileFor([mara], "mara")).toBe(mara);
  });

  it("creates profiles for style-sheet-only characters", () => {
    const profiles = buildVoiceProfiles([], { styleSheets });
    expect(profiles.map((p) => p.character).sort()).toEqual(["Guard", "Mara"]);
    expect(profiles.every((p) => p.samples.length === 0)).toBe(true);
  });

  it("spreads samples across scenes and keeps source order", () => {
    const chatty = Array.from({ length: 10 }, (_, i) => `Mara: Chatty line number ${i} here.`);
    const source = ["=== a ===", ...chatty, "=== b ===", "Mara: Only line in b.", "=== c ===", "Mara: Only line in c."];
    const [mara] = buildVoiceProfiles(extractDialogue(source.join("\n")), { maxSamples: 4 });
    expect(mara.samples.map((l) => l.flow)).toEqual(["a", "a", "b", "c"]);
    const lineNumbers = mara.samples.map((l) => l.line);
    expect(lineNumbers).toEqual([...lineNumbers].sort((x, y) => x - y));
  });

  it("prefers full lines over fragments and drops duplicates", () => {
    const source = "=== a ===\nMara: No.\nMara: No.\nMara: That is not going to happen.\n";
    const [mara] = buildVoiceProfiles(extractDialogue(source), { maxSamples: 1 });
    expect(mara.samples.map((l) => l.text)).toEqual(["That is not going to happen."]);
    const [all] = buildVoiceProfiles(extractDialogue(source));
    expect(all.samples).toHaveLength(2);
  });
});

describe("speakersIn", () => {
  it("lists speakers in a scene, including its stitches", () => {
    const source = "=== a ===\nMara: Hi.\n= s\nReyes: Yo.\nMARA: Again.\n=== b ===\nGuard: Halt.\n";
    expect(speakersIn(extractDialogue(source), "a")).toEqual(["Mara", "Reyes"]);
  });
});

describe("declared personas", () => {
  it("marks profiles with a writer-declared style sheet", () => {
    const styleSheets = parseStyleSheets("# Mara\n- Clipped.\n");
    const source = "=== a ===\nMara: Hi there friend.\nGuard: Halt right there.\n";
    const profiles = buildVoiceProfiles(extractDialogue(source), { styleSheets });
    expect(profileFor(profiles, "Mara")?.declared).toBe(true);
    expect(profileFor(profiles, "Guard")?.declared).toBe(false);
  });
});

describe("declaredCharactersIn", () => {
  it("finds declared characters mentioned in a scene, comments included, on word boundaries", async () => {
    const { declaredCharactersIn } = await import("../src");
    const sheets = parseStyleSheets("# Al\n- x\n# Mara\nAliases: M.R.\n# Guard\n- y\n");
    const source = "=== s ===\nThe alley is dark.\n// M.R. arrives later\n=== t ===\nGuard: Halt.\n";
    expect(declaredCharactersIn(source, "s", sheets)).toEqual(["Mara"]);
    expect(declaredCharactersIn("=== s ===\nAl waits.\n", "s", sheets)).toEqual(["Al"]);
    expect(declaredCharactersIn(source, "s", undefined)).toEqual([]);
  });

  it("gives an empty, outlined scene its character's voice profile", async () => {
    const { prepareCheck } = await import("../src");
    const prepared = prepareCheck(example("study/lighthouse.ink"), "night_watch", {
      styleSheet: example("study/lighthouse.voices.md"),
    });
    expect(prepared.speakers).toEqual(["Odile"]);
    expect(prepared.profiles[0]).toMatchObject({ character: "Odile", declared: true });
  });
});

describe("variableNotes", () => {
  it("reads trailing and preceding comments on declarations", async () => {
    const { variableNotes } = await import("../src");
    const source = [
      "// File header, not a note.",
      "",
      "VAR trust = 0 // -2 hostile, 2 trusting",
      "// Whether the player",
      "// has the map.",
      "VAR has_map = false",
      "VAR plain = 1",
      "LIST mood = calm, angry // Her mood",
    ].join("\n");
    expect(variableNotes(source)).toEqual({
      trust: "-2 hostile, 2 trusting",
      has_map: "Whether the player has the map.",
      mood: "Her mood",
    });
  });
});

describe("addStyleRule", () => {
  it("adds the rule at the end of the character's section, before the next heading", async () => {
    const { addStyleRule } = await import("../src");
    const sheet = "Intro.\n\n# Mara\n- Clipped.\n> Fine.\n\n# Guard\n- Curt.\n";
    const { text, line } = addStyleRule(sheet, "Mara", "Softens when  exhausted.");
    expect(text).toBe("Intro.\n\n# Mara\n- Clipped.\n> Fine.\n- Softens when exhausted.\n\n# Guard\n- Curt.\n");
    expect(text.split("\n")[line]).toBe("- Softens when exhausted.");
    expect(parseStyleSheets(text).characters[0].rules).toContain("Softens when exhausted.");
  });

  it("matches aliases case-insensitively and keeps CRLF line endings", async () => {
    const { addStyleRule } = await import("../src");
    const { text } = addStyleRule("# Mara\r\nAliases: MARA\r\n- Clipped.\r\n", "mara", "New rule.");
    expect(text).toBe("# Mara\r\nAliases: MARA\r\n- Clipped.\r\n- New rule.\r\n");
  });

  it("appends a new section, or starts a new sheet, when the character has none", async () => {
    const { addStyleRule } = await import("../src");
    const added = addStyleRule("# Guard\n- Curt.\n", "Odile", "Never exclaims.");
    expect(added.text).toBe("# Guard\n- Curt.\n\n# Odile\n- Never exclaims.\n");
    expect(added.text.split("\n")[added.line]).toBe("- Never exclaims.");
    const fresh = addStyleRule("", "Odile", "Never exclaims.");
    expect(fresh.text).toBe("# Odile\n- Never exclaims.\n");
    expect(fresh.line).toBe(1);
  });
});
