# Changelog

## 0.1.0

First release.

- Check the scene at the cursor against every story state that leads into it,
  with flags for voice, stance, and facts, each tagged with the states it
  applies to.
- List the incoming states for a knot without calling the API.
- Style sheets (`<story>.voices.md` or `voices.md`) declare how characters speak.
- Quick fixes to agree, disagree, or mark a flag as unsure, per state, and to
  turn a reason for disagreeing into a style-sheet rule.
- Settings for model, effort, and repeated runs.
