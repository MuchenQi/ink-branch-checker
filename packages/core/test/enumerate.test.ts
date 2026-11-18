import { describe, expect, it } from "vitest";
import { compileInk, enumerateStates, type Arrival, type TraceStep } from "../src";
import { bruteForcePathCount, loadExample } from "./helpers";

const choices = (trace: TraceStep[]) => trace.flatMap((s) => (s.kind === "choice" ? [s.text] : []));
const lines = (trace: TraceStep[]) => trace.flatMap((s) => (s.kind === "line" ? [s.text] : []));
const knots = (trace: TraceStep[]) => trace.flatMap((s) => (s.kind === "knot" ? [s.path] : []));

function findArrival(arrivals: Arrival[], choiceTexts: string[]): Arrival {
  const wanted = choiceTexts.join("|");
  const match = arrivals.find((a) => a.examples.some((e) => choices(e).join("|") === wanted));
  if (!match) throw new Error(`No arrival via ${choiceTexts.join(" > ")}`);
  return match;
}

describe("enumerateStates on betrayal.ink", () => {
  const story = loadExample("betrayal");
  const result = enumerateStates(story, { target: "campfire" });

  it("finds every incoming state and nothing is capped", () => {
    expect(result.arrivals).toHaveLength(6);
    expect(result.complete).toBe(true);
    expect(result.stats.pathsToTarget).toBe(bruteForcePathCount(story, "campfire"));
  });

  it("captures variables as they are on arrival", () => {
    const apologised = findArrival(result.arrivals, ["Let her talk", "Point at Mara", "Apologise"]);
    expect(apologised.variables).toMatchObject({ betrayed_mara: true, mara_trust: 3, mara_wounded: false });

    const alley = findArrival(result.arrivals, ["Take the side alley instead", "Buy it"]);
    expect(alley.variables).toMatchObject({ betrayed_mara: false, mara_trust: 5, mara_wounded: true, has_map: true });
    expect(alley.visits).toMatchObject({ gate: 1, alley: 1, market: 1 });
    expect(alley.visits.guards).toBeUndefined();
  });

  it("keeps a trace of knots, lines, and choices up to the target, but not the target's own text", () => {
    const trace = findArrival(result.arrivals, ["Let her talk", "Point at Mara", "Apologise"]).examples[0];
    expect(trace[0]).toEqual({ kind: "knot", path: "gate" });
    expect(knots(trace)).toEqual(["gate", "guards", "escape"]);
    expect(lines(trace)).toContain("Mara: You rat. You absolute rat.");
    expect(lines(trace).at(-1)).toBe("Mara: Sorry doesn't unlock cuffs.");
    expect(lines(trace).some((l) => l.includes("The fire pops"))).toBe(false);
  });
});

describe("enumerateStates on manor.ink (hub)", () => {
  const story = loadExample("manor");
  const result = enumerateStates(story, { target: "accusation" });

  it("merges orderings that reach the same state", () => {
    expect(result.stats.duplicateStates).toBeGreaterThan(0);
    expect(result.arrivals.length).toBeLessThan(result.stats.pathsToTarget);
  });

  it("still counts every path exactly", () => {
    expect(result.stats.pathsToTarget).toBe(bruteForcePathCount(story, "accusation"));
    const total = result.arrivals.reduce((n, a) => n + a.pathCount, 0);
    expect(total).toBe(result.stats.pathsToTarget);
  });

  it("keeps distinct example traces for merged states, capped by maxExamples", () => {
    const limited = enumerateStates(story, { target: "accusation", maxExamples: 2 });
    for (const arrival of limited.arrivals) {
      expect(arrival.examples.length).toBe(Math.min(2, arrival.pathCount));
      for (const trace of arrival.examples) expect(choices(trace).at(-1)).toBe("Make your accusation");
    }
    const traces = limited.arrivals.flatMap((a) => a.examples.map((e) => choices(e).join(">")));
    expect(new Set(traces).size).toBe(traces.length);
  });
});

describe("enumerateStates on ferry.ink (loops, RANDOM, externals)", () => {
  const story = loadExample("ferry");

  it("cuts the sticky loop and reports it", () => {
    const result = enumerateStates(story, { target: "dock" });
    expect(result.caps.visits.waiting).toBeGreaterThan(0);
    expect(result.complete).toBe(false);
  });

  it("warns about RANDOM when no seeds are given, and about unbound externals", () => {
    const warnings = enumerateStates(story, { target: "dock" }).warnings.join("\n");
    expect(warnings).toMatch(/RANDOM/);
    expect(warnings).toMatch(/play_sound/);
  });

  it("covers both RANDOM outcomes across seeds", () => {
    const result = enumerateStates(story, { target: "dock", seeds: [0, 1, 2, 3, 4, 5, 6, 7] });
    expect(new Set(result.arrivals.map((a) => a.variables.saw_storm))).toEqual(new Set([true, false]));
    expect(result.warnings.join("\n")).not.toMatch(/RANDOM/);
  });

  it("uses writer-provided external stubs", () => {
    const sounds: string[] = [];
    const result = enumerateStates(story, {
      target: "dock",
      externals: { play_sound: (name: string) => sounds.push(name) },
    });
    expect(sounds).toContain("waves");
    expect(result.warnings.join("\n")).not.toMatch(/play_sound/);
  });

  it("captures list values and tunnel effects", () => {
    const result = enumerateStates(story, { target: "dock" });
    const worked = findArrival(result.arrivals, ["Offer to work instead", "Go below deck"]);
    expect(worked.variables.cargo).toEqual(["cargo.crates"]);
    expect(worked.variables.captain_mood).toBe(1);
  });
});

describe("enumerateStates edge cases", () => {
  it("snapshots before the target's own content runs", () => {
    const story = compileInk(
      ["VAR x = 0", "-> before", "=== before ===", "~ x = 1", "Line before.", "-> scene",
       "=== scene ===", "~ x = 99", "In the scene.", "-> END"].join("\n"),
    );
    const [arrival] = enumerateStates(story, { target: "scene" }).arrivals;
    expect(arrival.variables.x).toBe(1);
    expect(arrival.examples[0].at(-1)).toEqual({ kind: "line", text: "Line before." });
  });

  it("handles a target entered mid-line through glue", () => {
    const story = compileInk(
      ["VAR x = 0", "-> before", "=== before ===", "Half a line <>", "~ x = 2", "-> scene",
       "=== scene ===", "~ x = 99", "and the rest.", "-> END"].join("\n"),
    );
    const [arrival] = enumerateStates(story, { target: "scene" }).arrivals;
    expect(arrival.variables.x).toBe(2);
    expect(arrival.examples[0].at(-1)).toEqual({ kind: "line", text: "Half a line" });
  });

  it("can target a stitch", () => {
    const story = compileInk(
      ["VAR is_late = false", "-> start", "=== start ===", "* [Early] -> camp.early", "* [Late]",
       "    ~ is_late = true", "    -> camp.late", "=== camp ===", "= early", "Early. -> END",
       "= late", "Late. -> END"].join("\n"),
    );
    const result = enumerateStates(story, { target: "camp.late" });
    expect(result.arrivals).toHaveLength(1);
    expect(result.arrivals[0].variables.is_late).toBe(true);
    expect(result.stats.endings).toBe(1);
  });

  it("counts paths that end without reaching the target", () => {
    const story = compileInk(
      ["-> a", "=== a ===", "* [Go] -> b", "* [Stop] -> END", "=== b ===", "B. -> END"].join("\n"),
    );
    const result = enumerateStates(story, { target: "b" });
    expect(result.stats.endings).toBe(1);
    expect(result.stats.pathsToTarget).toBe(1);
  });

  it("respects maxDepth and reports it", () => {
    const result = enumerateStates(loadExample("betrayal"), { target: "campfire", maxDepth: 1 });
    expect(result.caps.depth).toBeGreaterThan(0);
    expect(result.complete).toBe(false);
  });

  it("stops at maxChoicePoints and reports it", () => {
    const result = enumerateStates(loadExample("ferry"), { target: "dock", maxChoicePoints: 5 });
    expect(result.caps.budget).toBe(true);
    expect(result.stats.choicePoints).toBe(5);
  });

  it("abandons content that loops forever without a choice", () => {
    const story = compileInk(
      ["-> a", "=== a ===", "* [Loop] -> spin", "* [Go] -> b", "=== spin ===", "-> spin",
       "=== b ===", "B. -> END"].join("\n"),
    );
    const result = enumerateStates(story, { target: "b" });
    expect(result.arrivals).toHaveLength(1);
    expect(result.warnings.join("\n")).toMatch(/loops without offering a choice/);
  });

  it("rejects unknown targets and functions", () => {
    const story = loadExample("ferry");
    expect(() => enumerateStates(story, { target: "nope" })).toThrow(/Unknown target/);
    expect(() => enumerateStates(story, { target: "mood_word" })).toThrow(/Unknown target/);
  });
});
