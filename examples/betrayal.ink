// Convergent scene: "campfire" is reached from several paths with conflicting facts.
// Path A: you betray Mara to the guards (with or without an apology).
// Path B: you keep quiet at the gate and the guards let you through.
// Path C: you take the alley and Mara is wounded.
// The target scene is `campfire`.

VAR mara_trust = 5
VAR betrayed_mara = false
VAR mara_wounded = false
VAR has_map = false

-> gate

=== gate ===
Rain hammers the city gate. Mara pulls her hood low.
Mara: Keep your head down and let me do the talking.
* [Let her talk]
    -> guards
* [Take the side alley instead]
    -> alley

=== guards ===
A guard steps forward, lantern raised.
Guard: You. The tall one. I know that face.
* [Point at Mara] "She's the one you want," you say.
    ~ betrayed_mara = true
    ~ mara_trust = mara_trust - 4
    Mara: You rat. You absolute rat.
    -> escape
* [Stay quiet]
    Mara: Wrong face, friend. Happens all the time.
    The guard shrugs and waves you through.
    ~ mara_trust = mara_trust + 1
    -> market

=== escape ===
Mara slips her bonds and vanishes over the wall. You find her hours later by the river.
* [Apologise]
    You: I panicked. I'm sorry.
    Mara: Sorry doesn't unlock cuffs.
    ~ mara_trust = mara_trust + 2
    -> campfire
* [Say nothing]
    -> campfire

=== alley ===
The alley stinks of fish. A crossbow bolt whips out of the dark and catches Mara's arm.
~ mara_wounded = true
Mara: Fine. I'm fine. Keep moving.
-> market

=== market ===
A trader offers you a map of the hills.
* [Buy it]
    ~ has_map = true
* [Leave it]
- -> campfire

=== campfire ===
The fire pops. Mara stares into it.
{ betrayed_mara:
    Mara: Don't sit so close.
- else:
    Mara: Sit. You look half dead.
}
{ mara_wounded:
    She winces as she shifts her arm.
}
{ has_map:
    You unfold the map between you.
}
-> END
