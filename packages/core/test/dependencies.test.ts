import { describe, expect, it } from "vitest";
import { compileInk, findDependencies } from "../src";
import { loadExample } from "./helpers";

describe("findDependencies", () => {
  it("finds variables read in the scene", () => {
    const deps = findDependencies(loadExample("betrayal"), "campfire");
    expect(deps.variables).toEqual(["betrayed_mara", "has_map", "mara_wounded"]);
    expect(deps.visits).toEqual([]);
  });

  it("treats a bare knot name as a visit count", () => {
    const deps = findDependencies(loadExample("manor"), "accusation");
    expect(deps.variables).toEqual(["insulted_cook"]);
    expect(deps.visits).toEqual(["gardener"]);
  });

  it("follows function calls and skips list item constants", () => {
    const deps = findDependencies(loadExample("ferry"), "dock");
    expect(deps.variables).toEqual(["captain_mood", "cargo"]);
    expect(deps.scanned).toEqual(["dock", "mood_word"]);
  });

  it("follows tunnels and threads but not plain diverts out", () => {
    const story = compileInk(`
VAR a = 0
VAR b = 0
VAR c = 0
VAR d = 0
-> scene
=== scene ===
-> side ->
<- extra
{d}
-> elsewhere
=== side ===
{a} ->->
=== extra ===
{b} -> DONE
=== elsewhere ===
{c} -> END
`);
    const deps = findDependencies(story, "scene");
    expect(deps.variables).toEqual(["a", "b", "d"]);
    expect(deps.scanned).toEqual(["scene", "side", "extra"]);
  });

  it("finds READ_COUNT and TURNS_SINCE targets, and ignores temps and params", () => {
    const story = compileInk(`
VAR g = 0
-> scene(1)
=== scene(p) ===
~ temp t = p + g
{READ_COUNT(-> other)} {TURNS_SINCE(-> other.inner)} {t}
-> END
=== other ===
= inner
-> END
`);
    const deps = findDependencies(story, "scene");
    expect(deps.variables).toEqual(["g"]);
    expect(deps.visits).toEqual(["other", "other.inner"]);
  });
});
