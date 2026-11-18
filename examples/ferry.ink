// Lotus structure with the awkward parts of Ink: a tunnel, a function,
// a LIST, RANDOM, an EXTERNAL with no fallback, and a sticky loop.
// The target scene is `dock`.

EXTERNAL play_sound(name)

VAR captain_mood = 0
VAR paid_fare = false
VAR saw_storm = false
VAR waits = 0
LIST cargo = crates, livestock, contraband

-> pier

=== function mood_word()
{
- captain_mood >= 2:
    ~ return "warm"
- captain_mood <= -2:
    ~ return "cold"
- else:
    ~ return "flat"
}

=== pier ===
Captain Reyes leans on the rail.
Reyes: Fare's ten coins. No haggling, no exceptions.
* [Pay]
    ~ paid_fare = true
    ~ captain_mood += 1
* [Haggle]
    Reyes: What did I just say?
    ~ captain_mood -= 2
* [Offer to work instead]
    -> work_passage ->
- -> crossing

=== work_passage ===
You haul crates until your palms bleed.
~ cargo += crates
~ captain_mood += 1
->->

=== crossing ===
~ play_sound("waves")
{ RANDOM(1, 2) == 1:
    The sky turns green. A storm rolls in from the west.
    ~ saw_storm = true
- else:
    The water stays glassy all the way across.
}
-> waiting

=== waiting ===
The far shore creeps closer.
+ [Wait some more]
    ~ waits++
    -> waiting
* [Ask Reyes about the cargo]
    Reyes: You ask a lot for someone who {paid_fare: paid|didn't pay}.
    ~ cargo += contraband
    -> waiting
* [Go below deck] -> dock
// Not {waiting > 2}: diverting from a knot to itself does not bump its visit count.
+ {waits >= 2} [Stand at the bow] -> dock

=== dock ===
The ferry bumps against the dock.
Reyes: Mood's {mood_word()}. Off you go.
{ cargo has contraband:
    Reyes eyes the harbour patrol.
}
-> END
