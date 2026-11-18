// Example scene: the lighthouse.
// Three paths lead into `night_watch`, each leaving different facts behind.
// Write `night_watch`. Odile's voice is declared in lighthouse.voices.md.

VAR odile_trust = 0      // How Odile feels about the courier: -2 distrusts them (they stole from her), 0 neutral, 2 trusts them.
VAR lamp_lit = false     // The courier helped Odile repair and light the lamp.
VAR has_logbook = false  // The courier stole the keeper's logbook and still has it.
VAR player_injured = false  // The courier hurt their leg on the rocks.

-> arrival

=== arrival ===
Rain drives sideways across the headland. You have a letter for the keeper of the Saltmarrow light, and the keeper is not pleased to see you.
Odile: You have come a long way to stand in my doorway, courier. Come in before the sea decides to keep you.
She leaves you by the stove and climbs the stair to the lamp room.
* [Follow her up to the lamp room]
    -> lamp_room
* [Look around the keeper's desk]
    -> desk
* [Go out to the rocks for a look at the bay]
    -> rocks

=== lamp_room ===
The great lamp is dark. Odile is on her knees beside it with a cracked wick-holder in her hands.
Odile: The mechanism is older than I am, and considerably less patient.
You hold the lantern steady while she works, and between you the holder is set right.
~ lamp_lit = true
~ odile_trust = 2
As the beam swings out over the water, she speaks without looking at you.
Odile: My son kept this light before me. The sea took him off the Saltmarrow rocks eleven winters ago. I do not tell many people that.
-> night_watch

=== desk ===
On the desk lies the keeper's logbook, bound in oilcloth. Inside are tide tables, ship names, and a column of figures someone would pay well for.
You slip it into your coat just as the stair creaks.
~ has_logbook = true
~ odile_trust = -2
Odile: I keep my book on that desk, courier. I notice it is not on that desk now.
You say nothing. After a long moment she turns away.
Odile: Very well. The night is long and the door is locked. We shall see what kind of guest you are.
-> night_watch

=== rocks ===
The path to the rocks is slick with weed. Halfway down your foot goes out from under you and you fall hard against the stone.
~ player_injured = true
When you come to, Odile is hauling you up the path by your collar.
Odile: The sea does not like visitors on her rocks. You are fortunate she was distracted.
She binds your leg with a strip of sailcloth.
-> night_watch

=== night_watch ===
// Write this scene.
// It is past midnight. You and Odile sit in the lamp room. A ship's light appears far out in the bay.
-> END
