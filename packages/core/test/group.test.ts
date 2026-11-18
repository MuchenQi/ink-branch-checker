import { describe, expect, it } from "vitest";
import { enumerateStates, findDependencies, groupArrivals } from "../src";
import { loadExample } from "./helpers";

describe("groupArrivals", () => {
  const betrayal = loadExample("betrayal");
  const result = enumerateStates(betrayal, { target: "campfire" });
  const dependencies = findDependencies(betrayal, "campfire");

  it("merges arrivals that differ only in state the scene does not read", () => {
    const grouping = groupArrivals(betrayal, result, { dependencies, keepAllUpTo: 0 });
    expect(grouping.relevant.variables).toEqual(["betrayed_mara", "has_map", "mara_wounded"]);
    // The two betrayal paths differ only in mara_trust, which campfire does not read.
    expect(grouping.groups).toHaveLength(5);
    const betrayed = grouping.groups.find((g) => g.variables.betrayed_mara === true)!;
    expect(betrayed.arrivals).toHaveLength(2);
    expect(betrayed.pathCount).toBe(2);
  });

  it("adds variables named after characters in the scene", () => {
    const grouping = groupArrivals(betrayal, result, { dependencies, characters: ["Mara"], keepAllUpTo: 0 });
    expect(grouping.relevant.variables).toContain("mara_trust");
    expect(grouping.groups).toHaveLength(6);
  });

  it("does not match characters on partial words", () => {
    const grouping = groupArrivals(betrayal, result, { dependencies, characters: ["Ma"], keepAllUpTo: 0 });
    expect(grouping.relevant.variables).not.toContain("mara_trust");
  });

  it("accepts pinned variables and knots, and reports unknown pins", () => {
    const grouping = groupArrivals(betrayal, result, { dependencies, pin: ["mara_trust", "alley", "bogus"], keepAllUpTo: 0 });
    expect(grouping.relevant.variables).toContain("mara_trust");
    expect(grouping.relevant.visits).toEqual(["alley"]);
    expect(grouping.unknownPins).toEqual(["bogus"]);
  });

  it("groups hub arrivals by the visit counts the scene reads", () => {
    const manor = loadExample("manor");
    const manorResult = enumerateStates(manor, { target: "accusation" });
    const grouping = groupArrivals(manor, manorResult, {
      dependencies: findDependencies(manor, "accusation"),
      keepAllUpTo: 0,
    });
    const keys = grouping.groups.map((g) => `${g.variables.insulted_cook}/${g.visits.gardener}`).sort();
    expect(keys).toEqual(["false/0", "false/1", "true/1"]);
  });

  it("keeps every variable state when there are few, so prose-only facts are not merged away", () => {
    const grouping = groupArrivals(betrayal, result, { dependencies: { variables: [], visits: [], scanned: [] } });
    expect(grouping.mode).toBe("all");
    expect(grouping.groups).toHaveLength(6);
    expect(new Set(grouping.groups.map((g) => g.variables.has_map))).toEqual(new Set([true, false]));
  });

  it("falls back to merging by dependencies when there are too many states", () => {
    const grouping = groupArrivals(betrayal, result, { dependencies, keepAllUpTo: 5 });
    expect(grouping.mode).toBe("dependencies");
    expect(grouping.groups).toHaveLength(5);
  });
});
