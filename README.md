# Ink Branch Checker

Checks a writer's draft of a convergent Ink scene against every story state that
can lead into it, and flags lines where a character's voice or stance does not fit
one of those states, or where a line contradicts the state. The tool flags; the
writer decides. It never rewrites lines.

```
packages/core     state enumerator, voice profiles, checker, CLI
packages/vscode   thin VS Code extension
examples/         small .ink stories with convergent scenes
```

## Use

```
npm install
npm run build
npm test
```

In VS Code, run "Run Extension" (F5), open an example, put the cursor in a knot,
and run **Ink: List Incoming States for Knot at Cursor**.

## Core API

```ts
const compiled = compileInk(source);
const result = enumerateStates(compiled, { target: "campfire" });
const grouping = groupArrivals(compiled, result, {
  dependencies: findDependencies(compiled, "campfire"),
  characters: ["Mara"],
});
```

`enumerateStates` runs the story in inkjs and does a depth-first search over choices.
It snapshots variables and visit counts at the moment the target is entered, before
any of the target's content runs. Identical states are explored once (hubs collapse),
and path counts stay exact. Loops are cut by `maxVisitsPerKnot`, and long paths by
`maxDepth`. Both are reported in `result.caps`, and `result.complete` is false when
either was hit. RANDOM is deterministic per seed, so pass `seeds` to cover outcomes.

`groupArrivals` merges states that differ only in things the scene does not read.

## Checking a scene

```
npx ink-check examples/betrayal.ink campfire            # needs ANTHROPIC_API_KEY
npx ink-check examples/betrayal.ink campfire --dry-run  # print prompts, no API call
npx ink-check examples/betrayal.ink campfire --repeat 3 # show how often each flag recurs
```

With `--repeat n` (or the `inkBranchChecker.repeat` setting) every request runs n
times and each flag shows how often it recurred, per state: "states 1 (3/3), 3 (1/3)".
In testing, real problems recurred in every run while spurious flags mostly did not.
Nothing is filtered out; the counts are there for the writer to weigh.

Three kinds of flag: **voice** (how the line is said), **stance** (the character's
attitude, given what happened on this path), and **fact** (the line contradicts the
state). Motivation, behaviour, and plot logic are deliberately out of scope.

One Claude request per distinct incoming state. The system prompt and the
scene (draft plus voices) are identical across those requests and cached, so
only the first request pays for them in full. Flags are merged by line and say
which states they occur in. In VS Code, run **Ink: Check Scene at Cursor**;
flags appear as diagnostics. Set the key with **Ink: Set Anthropic API Key**.
Model and effort are settings (`inkBranchChecker.model`, `inkBranchChecker.effort`).

Each flag has quick fixes to mark it **agree**, **disagree** (hides it), or **not
sure**. A flag that covers several states lets you disagree for some of them only.
If you explain why you disagree with a voice or stance flag, the tool offers to
add your reason to the character's style sheet as a rule, for you to reword and
save. Flags are not claims of fact: you are the authority on your characters.

## Voices

```ts
const dialogue = extractDialogue(source);           // "Name: text" lines, or #speaker:Name tags
const speakers = speakersIn(dialogue, "campfire");
const profiles = buildVoiceProfiles(dialogue, {
  styleSheets: parseStyleSheets(markdown),          // optional
  exclude: "campfire",                              // never sample the scene being checked
  characters: speakers,
});
```

The writer declares each character's persona in a style sheet; the checker treats it
as the authority. Sample lines from the script are reference only, not persona
inference. Speakers without a style sheet are still checked, more conservatively,
and the tool says so.

A style sheet is Markdown with one heading per character. Bullets are rules, `>`
lines are example lines, and `Aliases:` lists other speaker names. See
[examples/betrayal.voices.md](examples/betrayal.voices.md). The extension picks up
`<story>.voices.md` or `voices.md` next to the ink file.
