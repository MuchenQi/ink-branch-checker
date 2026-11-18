// Hub and spokes: question witnesses in any order, then converge on `accusation`.
// Different orders lead to the same state, so the enumerator should collapse them.

VAR clues = 0
VAR suspect = "nobody"
VAR insulted_cook = false

-> hall

=== hall ===
{The manor hall is quiet.|You return to the hall.|The hall again. The clock ticks on.}
* [Question the cook] -> cook
* [Question the gardener] -> gardener
* [Search the study] -> study
+ {clues >= 2} [Make your accusation] -> accusation

=== cook ===
Cook: Thirty years in this kitchen. I see everything.
* [Flatter her]
    Cook: Well. Since you ask so nicely. The master took his tea at nine, not ten.
    ~ clues += 1
* [Accuse her]
    ~ insulted_cook = true
    Cook: Get out of my kitchen.
- -> hall

=== gardener ===
Gardener: Muddy boots by the study door. Not mine.
~ clues += 1
~ suspect = "the nephew"
-> hall

=== study ===
A torn letter lies in the grate, signed with a single initial.
~ clues += 1
-> hall

=== accusation ===
Everyone gathers in the hall.
{ insulted_cook:
    The cook refuses to look at you.
}
{ gardener:
    The gardener nods at you from the doorway.
}
Inspector: Well? Who did it?
-> END
