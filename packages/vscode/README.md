# Ink Branch Checker

In a branching story, one scene can be reached from several pasts. A line that
fits after the player helped a character can read wrong after they betrayed her.
Ink Branch Checker finds every story state that leads into the scene you are
writing, then checks your draft against each one and flags lines where:

- **voice**: the character does not sound like themselves,
- **stance**: their attitude does not fit what happened on that path,
- **fact**: the line contradicts what is true on that path.

Each flag says which incoming states it applies to. The checker never rewrites
your lines. You decide what counts as out of character.

## Getting started

1. Install the extension and open a folder with your `.ink` files.
2. Run **Ink: Set Anthropic API Key** from the Command Palette (F1). Checks use
   your own key; get one at [console.anthropic.com](https://console.anthropic.com).
3. Put the cursor inside the knot or stitch you are writing and run
   **Ink: Check Scene at Cursor**.

Flags appear as squiggles and in the Problems panel. The Output panel ("Ink Branch
Checker") lists the incoming states, with an example path into each.

To see the incoming states without calling the API, run
**Ink: List Incoming States for Knot at Cursor**.

## How it works

The extension plays your story with [inkjs](https://github.com/y-lohse/inkjs),
Ink's own runtime, trying every choice. Each time a path enters your scene it
records the variables and visit counts, and states that differ only in things the
scene does not depend on are merged. Claude then reviews the scene once for
voice, and once per incoming state for stance and facts.

## Style sheets

Tell the checker how your characters speak by putting a style sheet next to the
story: `<story>.voices.md`, or `voices.md` for a whole folder.

```markdown
# Odile
Aliases: ODILE
- Formal and measured. Never uses contractions.
- Calls the player "courier". She does not use warmer names.
- When she distrusts someone she becomes more polite, not less.
> You have come a long way to stand in my doorway, courier.
```

One heading per character. Bullets are rules, `>` lines are example lines, and
`Aliases:` lists other speaker names. The style sheet is the authority; the
character's lines elsewhere in the script are used as reference. Characters
without a style sheet are still checked, more cautiously, and the output says so.

Dialogue is recognised as `Name: line` or as a line tagged `#speaker: Name`.
Comments on `VAR` lines (`VAR trust = 0 // -2 hostile, 2 trusting`) are passed
to the checker, so it knows what your numbers mean.

## Agreeing and disagreeing

Each flag has quick fixes (Ctrl+. on the line):

- **Agree** or **Not sure** keeps the flag and shows your verdict.
- **Disagree** hides it. If the flag covers several states, you can disagree for
  some of them only.
- **Disagree and explain why** asks for your reason. For voice and stance flags,
  it offers to add the reason to the character's style sheet as a rule, so the
  next check knows. The sheet opens with the rule selected for you to reword and
  save.

## Settings

| Setting | Default | What it does |
|---|---|---|
| `inkBranchChecker.model` | `claude-sonnet-5-5` | The Claude model that reviews scenes. `claude-opus-5-5` costs more but catches subtler voice problems. |
| `inkBranchChecker.effort` | `high` | How much the model thinks per review: `low`, `medium`, `high`, `xhigh`, `max`. Lower is cheaper and faster. |
| `inkBranchChecker.repeat` | `1` | Run each review up to 5 times and show how often each flag recurs. Real problems tend to recur; spurious flags tend not to. Each run is billed. |

## Cost and privacy

Checks are billed to your Anthropic account. With the default model, a scene with
three incoming states costs roughly $0.05 per check, and about $0.08 with
`claude-opus-5-5`. Cost grows with the number of incoming states and with `repeat`.

Each check sends Anthropic the scene you are checking, your style sheet, sample
lines for each speaker from elsewhere in the script, and, for each incoming
state, its variables and an example path through the story. The API key is kept
in VS Code's secret storage. Nothing else leaves your machine.

## Limitations

- Stories split across `INCLUDE` files are not supported yet.
- `RANDOM` and shuffles are explored with one fixed seed, so outcomes that need a
  different roll can be missed.
- Very large stories are explored up to fixed limits; the output warns when a
  limit was hit and some incoming states may be missing.
- The extension registers `.ink` files but does not add syntax highlighting. Use
  it alongside an Ink syntax extension.

## Command line

The same checker runs from a terminal, for scripts and CI. See the
[repository](https://github.com/MuchenQi/ink-branch-checker).

## License

MIT
