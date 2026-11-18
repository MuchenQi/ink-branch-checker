# Example scenes

Two matched scenarios to try the checker on. Each has three paths into one
convergent scene, left empty for you to write.

| | Lighthouse | Inn |
|---|---|---|
| File | `lighthouse.ink` | `inn.ink` |
| Scene to write | `night_watch` | `cellar` |
| Character | Odile, the keeper | Tamsin, the innkeeper's daughter |
| Voice | formal, no contractions, never exclaims | fast, run-on, "aye", jokes when scared |
| Style sheet | `lighthouse.voices.md` | `inn.voices.md` |

Both scenarios have the same structure. Three paths lead into the scene, each
leaving different facts behind:

| Path | Lighthouse | Inn |
|---|---|---|
| Trust | help Odile mend the lamp | fight off a drunk who grabs Tamsin |
| Hostile | steal Odile's logbook | pose as a royal inspector |
| Neutral | fall on the rocks and hurt your leg | cannot pay, wash pots all night |

On the trust path the character also confides something in dialogue that no
variable records (Odile's drowned son, Tamsin's plan to leave), so the checker
has to read the path, not just the variables.

Variables are explained in comments on their `VAR` lines; the tool passes those
notes to the checker.

## Try it

Write the scene so it works whichever path the player took: lines that hold on
every path, or Ink conditionals for the ones that differ. Then run
**Ink: Check Scene at Cursor** with the cursor inside it.

## Seeded drafts

`seeded/` holds a drafted version of each scene with five planted slips of voice,
stance, and fact. Check one to see what flags look like before writing your own:

```
npx ink-check examples/study/seeded/lighthouse.ink night_watch
npx ink-check examples/study/seeded/inn.ink cellar
```

`harbour.ink` has twelve incoming states, and `stress/harbour-long.ink` is a
1,569-line version with sixteen, for seeing how the checker handles larger scripts.
