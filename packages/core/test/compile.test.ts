import { describe, expect, it } from "vitest";
import { compileInk, InkCompileError } from "../src";
import { loadExample } from "./helpers";

describe("compileInk", () => {
  it("lists knots, stitches, functions, globals, and externals", () => {
    const ferry = loadExample("ferry");
    expect(ferry.flows.get("dock")?.kind).toBe("knot");
    expect(ferry.flows.get("mood_word")?.kind).toBe("function");
    expect(ferry.globals).toEqual(expect.arrayContaining(["captain_mood", "paid_fare", "cargo"]));
    expect(ferry.externals).toEqual(["play_sound"]);
  });

  it("finds stitches", () => {
    const story = compileInk("-> a\n=== a ===\n= one\nHi -> END\n= two\nBye -> END\n");
    expect(story.flows.get("a.one")?.kind).toBe("stitch");
    expect(story.flows.get("a.two")?.kind).toBe("stitch");
  });

  it("detects RANDOM and TURNS", () => {
    expect(loadExample("ferry").features).toEqual({ random: true, turns: false });
    expect(loadExample("betrayal").features).toEqual({ random: false, turns: false });
    const turns = compileInk("-> a\n=== a ===\n{TURNS_SINCE(-> a)} -> END\n");
    expect(turns.features.turns).toBe(true);
  });

  it("does not mistake a knot named like a command for the command", () => {
    const story = compileInk("-> turns\n=== turns ===\nHi -> END\n");
    expect(story.features.turns).toBe(false);
  });

  it("throws InkCompileError with messages on bad ink", () => {
    expect(() => compileInk("-> nowhere\n")).toThrow(InkCompileError);
    try {
      compileInk("-> nowhere\n");
    } catch (err) {
      expect((err as InkCompileError).errors.join("\n")).toMatch(/nowhere/);
    }
  });
});
