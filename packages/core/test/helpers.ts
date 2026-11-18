import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Story } from "inkjs/engine/Story";
import { compileInk, type CompiledStory } from "../src";

export function loadExample(name: string): CompiledStory {
  const source = readFileSync(join(__dirname, "../../../examples", `${name}.ink`), "utf8");
  return compileInk(source, { fileName: `${name}.ink` });
}

/**
 * Oracle: count choice sequences that reach `target`, by plain DFS with no
 * memoization and no hooks. Only usable on small stories without loops.
 */
export function bruteForcePathCount(compiled: CompiledStory, target: string, seed = 0): number {
  const story = new Story(compiled.json);
  story.state.storySeed = seed;
  story.allowExternalFunctionFallbacks = true;
  for (const name of compiled.externals) story.BindExternalFunction(name, () => 0, true);

  const walk = (): number => {
    while (story.canContinue) {
      story.Continue();
      if ((story.state.VisitCountAtPathString(target) ?? 0) > 0) return 1;
    }
    const saved = story.state.ToJson();
    const count = story.currentChoices.length;
    let total = 0;
    for (let i = 0; i < count; i++) {
      story.state.LoadJson(saved);
      story.ChooseChoiceIndex(i);
      total += walk();
    }
    return total;
  };
  return walk();
}
