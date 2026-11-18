// Example scene (harder): the harbour.
// State accumulates over three choice points and a hub: twelve incoming states.
// The target scene is `crossing`. Corin's voice is declared in harbour.voices.md.

VAR corin_trust = 0       // How Corin feels about the player: below 0 wary, 0 or 1 guarded, 2 or more trusts them.
VAR lied_name = false     // The player told Corin their name is Ash. Their real name is Wren.
VAR has_knife = false     // The player bought a knife at the market and carries it.
VAR blessed = false       // A temple priest blessed the player. Corin, who is superstitious, approves.
VAR warned_corin = false  // The player warned Corin that the harbour watch was coming for him.
VAR errands = 0           // Errands run in town before dusk.

-> tavern

=== tavern ===
A man with salt in his beard slides onto the bench across from you.
Corin: Corin. Run cargo. You the one wants passage across tonight?
Corin: Name?
* [Tell him your name is Wren]
    ~ corin_trust += 1
    Corin: Wren. Good. Honest names float.
* [Tell him your name is Ash]
    ~ lied_name = true
    ~ corin_trust -= 1
    Corin: Ash. Sure it is.
- Corin: Boat leaves at dark. Two errands, no more, then meet me at the slip.
-> town

=== town ===
{ errands >= 2: -> dusk }
The town is all steps and gulls.
* [Go to the market]
    -> market
* [Go down to the docks]
    -> docks
* [Visit the temple]
    -> temple

=== market ===
A stallholder sells you a short knife with a cork handle.
~ has_knife = true
~ corin_trust -= 1
~ errands++
-> town

=== docks ===
Behind a stack of crates you overhear two dockhands.
Dockhand: Corin owes Mother Hask more than that boat is worth. She will take it out of him one way or another.
~ errands++
-> town

=== temple ===
A priest marks your forehead with oil and wishes you a calm crossing.
~ blessed = true
~ corin_trust += 1
~ errands++
-> town

=== dusk ===
At the slip, Corin is untying the boat. {has_knife: His eyes go to the knife at your belt.}
On the way down you saw the harbour watch gathering by the customs house.
* [Warn Corin that the watch is coming]
    ~ warned_corin = true
    ~ corin_trust += 2
    Corin: Then we go now.
* [Say nothing]
    Corin: In you get.
- -> crossing

=== crossing ===
// Write this scene.
// Night. You and Corin row across the black harbour, past the watch.
-> END
