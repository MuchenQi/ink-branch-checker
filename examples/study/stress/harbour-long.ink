// Stress test: the harbour scenario inside a long script.
// Generated from harbour.ink with filler scenes around it.
// The target scene is `crossing`. Corin's voice is declared in harbour-long.voices.md.

VAR corin_trust = 0       // How Corin feels about the player: below 0 wary, 0 or 1 guarded, 2 or more trusts them.
VAR lied_name = false     // The player told Corin their name is Ash. Their real name is Wren.
VAR has_knife = false     // The player bought a knife at the market and carries it.
VAR blessed = false       // A temple priest blessed the player. Corin, who is superstitious, approves.
VAR warned_corin = false  // The player warned Corin that the harbour watch was coming for him.
VAR errands = 0           // Errands run in town before dusk.

-> prologue_1

=== function shift(ref x, by) ===
~ x = x + by

=== prologue_1 ===
Smoke from a dozen chimneys hangs low over the rooftops.
A cat watches you from a windowsill without blinking.
A dog follows you for a while, then loses interest.
Footsteps echo on the steps that climb up from the water.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Gulls argue over a fish head on the harbour wall.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
A man is mending a lobster pot with quick, scarred fingers.
Gulls argue over a fish head on the harbour wall.
Two fishwives laugh at something you did not hear.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Ropes creak as the moored boats shift against the quay.
A man is mending a lobster pot with quick, scarred fingers.
Ropes creak as the moored boats shift against the quay.
Carter: Road's washed out past the mill. You'll want the cliff path.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Smoke from a dozen chimneys hangs low over the rooftops.
Nets are drying on poles along the shingle, brown and stiff with salt.
The tide has gone out a long way, and the mud shines like pewter.
Netmaker: Six days to make a net and one bad night to lose it.
The light goes grey, then gold, then grey again as the clouds pass.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
A boy runs past with a basket of eels, shouting a price nobody pays.
The tide has gone out a long way, and the mud shines like pewter.
The tide has gone out a long way, and the mud shines like pewter.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
A dog follows you for a while, then loses interest.
Smoke from a dozen chimneys hangs low over the rooftops.
Gulls argue over a fish head on the harbour wall.
The cobbles are slick with last night's rain.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Washing snaps on a line strung between two windows.
The cobbles are slick with last night's rain.
A boy runs past with a basket of eels, shouting a price nobody pays.
The chapel bell strikes the hour, a little late.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
-> prologue_2

=== prologue_2 ===
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Dockhand: Watch has been sniffing round the customs house all week.
The light goes grey, then gold, then grey again as the clouds pass.
A dog follows you for a while, then loses interest.
Old Bessa: My grandmother said the fog remembers every face it hides.
Smoke from a dozen chimneys hangs low over the rooftops.
Gulls argue over a fish head on the harbour wall.
The chapel bell strikes the hour, a little late.
Somewhere below, a bell buoy clanks in the swell.
Smoke from a dozen chimneys hangs low over the rooftops.
Netmaker: Six days to make a net and one bad night to lose it.
A boy runs past with a basket of eels, shouting a price nobody pays.
Netmaker: Six days to make a net and one bad night to lose it.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Priest: Walk carefully. The saints are busy this time of year.
The air tastes of coal smoke and seaweed.
A cat watches you from a windowsill without blinking.
Old Bessa: My grandmother said the fog remembers every face it hides.
A boy runs past with a basket of eels, shouting a price nobody pays.
A dog follows you for a while, then loses interest.
Lamplight spills from a doorway and is swallowed by the fog.
Footsteps echo on the steps that climb up from the water.
The tide has gone out a long way, and the mud shines like pewter.
Two fishwives laugh at something you did not hear.
Ropes creak as the moored boats shift against the quay.
The air tastes of coal smoke and seaweed.
Old Bessa: My grandmother said the fog remembers every face it hides.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
The cobbles are slick with last night's rain.
Smoke from a dozen chimneys hangs low over the rooftops.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Footsteps echo on the steps that climb up from the water.
The cobbles are slick with last night's rain.
A cart rattles past loaded with barrels that smell of tar and salt.
Nets are drying on poles along the shingle, brown and stiff with salt.
The chapel bell strikes the hour, a little late.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Smoke from a dozen chimneys hangs low over the rooftops.
Two fishwives laugh at something you did not hear.
-> prologue_3

=== prologue_3 ===
Footsteps echo on the steps that climb up from the water.
A cat watches you from a windowsill without blinking.
Priest: Walk carefully. The saints are busy this time of year.
Somewhere below, a bell buoy clanks in the swell.
Lamplight spills from a doorway and is swallowed by the fog.
Gulls argue over a fish head on the harbour wall.
Two fishwives laugh at something you did not hear.
A man is mending a lobster pot with quick, scarred fingers.
Somewhere below, a bell buoy clanks in the swell.
Nets are drying on poles along the shingle, brown and stiff with salt.
Old Bessa: My grandmother said the fog remembers every face it hides.
Dockhand: Watch has been sniffing round the customs house all week.
The tide has gone out a long way, and the mud shines like pewter.
Netmaker: Six days to make a net and one bad night to lose it.
The light goes grey, then gold, then grey again as the clouds pass.
Old Bessa: My grandmother said the fog remembers every face it hides.
Priest: Walk carefully. The saints are busy this time of year.
Nets are drying on poles along the shingle, brown and stiff with salt.
A cart rattles past loaded with barrels that smell of tar and salt.
A cart rattles past loaded with barrels that smell of tar and salt.
A cart rattles past loaded with barrels that smell of tar and salt.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The light goes grey, then gold, then grey again as the clouds pass.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Netmaker: Six days to make a net and one bad night to lose it.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Somewhere below, a bell buoy clanks in the swell.
Carter: Road's washed out past the mill. You'll want the cliff path.
A dog follows you for a while, then loses interest.
Ropes creak as the moored boats shift against the quay.
Somewhere below, a bell buoy clanks in the swell.
Dockhand: Watch has been sniffing round the customs house all week.
Two fishwives laugh at something you did not hear.
Dockhand: Watch has been sniffing round the customs house all week.
Gulls argue over a fish head on the harbour wall.
Carter: Road's washed out past the mill. You'll want the cliff path.
Old Bessa: My grandmother said the fog remembers every face it hides.
The tide has gone out a long way, and the mud shines like pewter.
A dog follows you for a while, then loses interest.
A letter of introduction for a smuggler called Corin is pressed into your hand. It speaks well of you.
~ shift(corin_trust, 1)
-> prologue_4

=== prologue_4 ===
A dog follows you for a while, then loses interest.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
A dog follows you for a while, then loses interest.
A cat watches you from a windowsill without blinking.
The chapel bell strikes the hour, a little late.
Nets are drying on poles along the shingle, brown and stiff with salt.
Two fishwives laugh at something you did not hear.
A cat watches you from a windowsill without blinking.
The air tastes of coal smoke and seaweed.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Gulls argue over a fish head on the harbour wall.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
A man is mending a lobster pot with quick, scarred fingers.
Netmaker: Six days to make a net and one bad night to lose it.
Priest: Walk carefully. The saints are busy this time of year.
Carter: Road's washed out past the mill. You'll want the cliff path.
Netmaker: Six days to make a net and one bad night to lose it.
Lamplight spills from a doorway and is swallowed by the fog.
A boy runs past with a basket of eels, shouting a price nobody pays.
A dog follows you for a while, then loses interest.
A cart rattles past loaded with barrels that smell of tar and salt.
A dog follows you for a while, then loses interest.
Old Bessa: My grandmother said the fog remembers every face it hides.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Nets are drying on poles along the shingle, brown and stiff with salt.
A cat watches you from a windowsill without blinking.
The tide has gone out a long way, and the mud shines like pewter.
Footsteps echo on the steps that climb up from the water.
The tide has gone out a long way, and the mud shines like pewter.
Gulls argue over a fish head on the harbour wall.
Netmaker: Six days to make a net and one bad night to lose it.
The chapel bell strikes the hour, a little late.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Lamplight spills from a doorway and is swallowed by the fog.
Lamplight spills from a doorway and is swallowed by the fog.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
The light goes grey, then gold, then grey again as the clouds pass.
The cobbles are slick with last night's rain.
-> prologue_5

=== prologue_5 ===
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Footsteps echo on the steps that climb up from the water.
Carter: Road's washed out past the mill. You'll want the cliff path.
Lamplight spills from a doorway and is swallowed by the fog.
A cart rattles past loaded with barrels that smell of tar and salt.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Nets are drying on poles along the shingle, brown and stiff with salt.
A cat watches you from a windowsill without blinking.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
A cat watches you from a windowsill without blinking.
The chapel bell strikes the hour, a little late.
A man is mending a lobster pot with quick, scarred fingers.
A dog follows you for a while, then loses interest.
A dog follows you for a while, then loses interest.
Old Bessa: My grandmother said the fog remembers every face it hides.
The air tastes of coal smoke and seaweed.
The chapel bell strikes the hour, a little late.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Somewhere below, a bell buoy clanks in the swell.
A dog follows you for a while, then loses interest.
Dockhand: Watch has been sniffing round the customs house all week.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The chapel bell strikes the hour, a little late.
A cart rattles past loaded with barrels that smell of tar and salt.
Washing snaps on a line strung between two windows.
Somewhere below, a bell buoy clanks in the swell.
A boy runs past with a basket of eels, shouting a price nobody pays.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
A man is mending a lobster pot with quick, scarred fingers.
Footsteps echo on the steps that climb up from the water.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Netmaker: Six days to make a net and one bad night to lose it.
The tide has gone out a long way, and the mud shines like pewter.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Somewhere below, a bell buoy clanks in the swell.
The chapel bell strikes the hour, a little late.
Gulls argue over a fish head on the harbour wall.
-> prologue_6

=== prologue_6 ===
Two fishwives laugh at something you did not hear.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Gulls argue over a fish head on the harbour wall.
The air tastes of coal smoke and seaweed.
The tide has gone out a long way, and the mud shines like pewter.
Old Bessa: My grandmother said the fog remembers every face it hides.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
A cart rattles past loaded with barrels that smell of tar and salt.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Somewhere below, a bell buoy clanks in the swell.
A cart rattles past loaded with barrels that smell of tar and salt.
Lamplight spills from a doorway and is swallowed by the fog.
Netmaker: Six days to make a net and one bad night to lose it.
Somewhere below, a bell buoy clanks in the swell.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Two fishwives laugh at something you did not hear.
Washing snaps on a line strung between two windows.
The chapel bell strikes the hour, a little late.
A boy runs past with a basket of eels, shouting a price nobody pays.
A cart rattles past loaded with barrels that smell of tar and salt.
A cat watches you from a windowsill without blinking.
Smoke from a dozen chimneys hangs low over the rooftops.
Carter: Road's washed out past the mill. You'll want the cliff path.
The chapel bell strikes the hour, a little late.
The chapel bell strikes the hour, a little late.
Washing snaps on a line strung between two windows.
The chapel bell strikes the hour, a little late.
A cart rattles past loaded with barrels that smell of tar and salt.
The light goes grey, then gold, then grey again as the clouds pass.
A cart rattles past loaded with barrels that smell of tar and salt.
Dockhand: Watch has been sniffing round the customs house all week.
The tide has gone out a long way, and the mud shines like pewter.
Lamplight spills from a doorway and is swallowed by the fog.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
The light goes grey, then gold, then grey again as the clouds pass.
Old Bessa: My grandmother said the fog remembers every face it hides.
A boy runs past with a basket of eels, shouting a price nobody pays.
Footsteps echo on the steps that climb up from the water.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
In the last village you hear that word of your unpaid debts has gone ahead of you, all the way to the harbour.
~ shift(corin_trust, -1)
-> prologue_7

=== prologue_7 ===
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Dockhand: Watch has been sniffing round the customs house all week.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Somewhere below, a bell buoy clanks in the swell.
A cat watches you from a windowsill without blinking.
Ropes creak as the moored boats shift against the quay.
Washing snaps on a line strung between two windows.
The chapel bell strikes the hour, a little late.
Ropes creak as the moored boats shift against the quay.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Carter: Road's washed out past the mill. You'll want the cliff path.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
A boy runs past with a basket of eels, shouting a price nobody pays.
Somewhere below, a bell buoy clanks in the swell.
Footsteps echo on the steps that climb up from the water.
The tide has gone out a long way, and the mud shines like pewter.
A dog follows you for a while, then loses interest.
Smoke from a dozen chimneys hangs low over the rooftops.
A cat watches you from a windowsill without blinking.
Netmaker: Six days to make a net and one bad night to lose it.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Ropes creak as the moored boats shift against the quay.
The light goes grey, then gold, then grey again as the clouds pass.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
A cart rattles past loaded with barrels that smell of tar and salt.
A cart rattles past loaded with barrels that smell of tar and salt.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Smoke from a dozen chimneys hangs low over the rooftops.
Old Bessa: My grandmother said the fog remembers every face it hides.
Dockhand: Watch has been sniffing round the customs house all week.
The chapel bell strikes the hour, a little late.
The tide has gone out a long way, and the mud shines like pewter.
Netmaker: Six days to make a net and one bad night to lose it.
A boy runs past with a basket of eels, shouting a price nobody pays.
Dockhand: Watch has been sniffing round the customs house all week.
Somewhere below, a bell buoy clanks in the swell.
Two fishwives laugh at something you did not hear.
Somewhere below, a bell buoy clanks in the swell.
-> prologue_8

=== prologue_8 ===
A boy runs past with a basket of eels, shouting a price nobody pays.
The air tastes of coal smoke and seaweed.
Two fishwives laugh at something you did not hear.
Footsteps echo on the steps that climb up from the water.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
The tide has gone out a long way, and the mud shines like pewter.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Lamplight spills from a doorway and is swallowed by the fog.
A man is mending a lobster pot with quick, scarred fingers.
Priest: Walk carefully. The saints are busy this time of year.
Footsteps echo on the steps that climb up from the water.
The chapel bell strikes the hour, a little late.
A boy runs past with a basket of eels, shouting a price nobody pays.
The light goes grey, then gold, then grey again as the clouds pass.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Netmaker: Six days to make a net and one bad night to lose it.
The chapel bell strikes the hour, a little late.
Footsteps echo on the steps that climb up from the water.
A man is mending a lobster pot with quick, scarred fingers.
Carter: Road's washed out past the mill. You'll want the cliff path.
Washing snaps on a line strung between two windows.
Dockhand: Watch has been sniffing round the customs house all week.
Smoke from a dozen chimneys hangs low over the rooftops.
Smoke from a dozen chimneys hangs low over the rooftops.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The light goes grey, then gold, then grey again as the clouds pass.
Somewhere below, a bell buoy clanks in the swell.
Netmaker: Six days to make a net and one bad night to lose it.
Carter: Road's washed out past the mill. You'll want the cliff path.
A boy runs past with a basket of eels, shouting a price nobody pays.
The chapel bell strikes the hour, a little late.
The cobbles are slick with last night's rain.
A cat watches you from a windowsill without blinking.
The cobbles are slick with last night's rain.
The light goes grey, then gold, then grey again as the clouds pass.
Washing snaps on a line strung between two windows.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Netmaker: Six days to make a net and one bad night to lose it.
-> tavern

=== tavern ===
A man with salt in his beard slides onto the bench across from you.
Corin: Corin. Run cargo. You the one wants passage across tonight?
Corin: Name?
* [Tell him your name is Wren]
    ~ shift(corin_trust, 1)
    Corin: Wren. Good. Honest names float.
* [Tell him your name is Ash]
    ~ lied_name = true
    ~ shift(corin_trust, -1)
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
* [Pick a fight with the watch]
    -> arrest

=== market ===
A stallholder sells you a short knife with a cork handle.
~ has_knife = true
~ shift(corin_trust, -1)
-> haggle ->
~ errands++
-> town

=== haggle ===
{ blessed:
    The stallholder sees the oil on your forehead and knocks a coin off the price.
    Stallholder: Corin is my cousin. I will tell him you are blessed.
    ~ shift(corin_trust, 1)
}
->->

=== docks ===
Behind a stack of crates you overhear two dockhands.
Dockhand: Corin owes Mother Hask more than that boat is worth. She will take it out of him one way or another.
~ errands++
-> town

=== temple ===
A priest marks your forehead with oil and wishes you a calm crossing.
~ blessed = true
~ shift(corin_trust, 1)
~ errands++
-> town

=== arrest ===
You throw a punch at the nearest watchman. It goes badly.
~ has_knife = false
~ shift(corin_trust, -3)
Watchman: That is a night in the cells, and your passage is gone with it.
Word reaches Corin before dark. He sails without you.
-> END

=== dusk ===
{ corin_trust < 0: -> cold }
At the slip, Corin is untying the boat.
-> warn
= cold
At the slip, Corin watches you come down the steps and does not untie the boat until you are close.
-> warn
= warn
{has_knife: His eyes go to the knife at your belt.}
On the way down you saw the harbour watch gathering by the customs house.
* [Warn Corin that the watch is coming]
    ~ warned_corin = true
    ~ shift(corin_trust, 2)
    Corin: Then we go now.
* [Say nothing]
    Corin: In you get.
- -> crossing

=== crossing ===
The oars dip without a sound. Lanterns move along the far wall.
Corin: Quiet now. Water carries at night.
Corin: Thank you ever so much for your assistance this evening.
Corin: Hand me that oar, Wren.
Corin: Put that knife away before you cut yourself.
Corin: Never have made it past the watch without your warning.
Corin: Aye, you heard right at the docks. Owe Mother Hask more than this boat's worth.
Corin: I'd trust you with my life, mate.
Corin: Touch wood. Nearly across.
-> chapter_3_1

=== chapter_3_1 ===
Lamplight spills from a doorway and is swallowed by the fog.
A boy runs past with a basket of eels, shouting a price nobody pays.
Two fishwives laugh at something you did not hear.
Gulls argue over a fish head on the harbour wall.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Dockhand: Watch has been sniffing round the customs house all week.
A man is mending a lobster pot with quick, scarred fingers.
A dog follows you for a while, then loses interest.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Smoke from a dozen chimneys hangs low over the rooftops.
The cobbles are slick with last night's rain.
A boy runs past with a basket of eels, shouting a price nobody pays.
A boy runs past with a basket of eels, shouting a price nobody pays.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Netmaker: Six days to make a net and one bad night to lose it.
Priest: Walk carefully. The saints are busy this time of year.
The light goes grey, then gold, then grey again as the clouds pass.
Washing snaps on a line strung between two windows.
A man is mending a lobster pot with quick, scarred fingers.
A cart rattles past loaded with barrels that smell of tar and salt.
The cobbles are slick with last night's rain.
Footsteps echo on the steps that climb up from the water.
A boy runs past with a basket of eels, shouting a price nobody pays.
Washing snaps on a line strung between two windows.
A dog follows you for a while, then loses interest.
A cart rattles past loaded with barrels that smell of tar and salt.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
The air tastes of coal smoke and seaweed.
Ropes creak as the moored boats shift against the quay.
Two fishwives laugh at something you did not hear.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Netmaker: Six days to make a net and one bad night to lose it.
Washing snaps on a line strung between two windows.
Footsteps echo on the steps that climb up from the water.
The tide has gone out a long way, and the mud shines like pewter.
The cobbles are slick with last night's rain.
Corin: Hold her steady.
Corin: Keep low. Wind's turning.
Corin: Not my business, mate.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_2

=== chapter_3_2 ===
The tide has gone out a long way, and the mud shines like pewter.
Ropes creak as the moored boats shift against the quay.
Carter: Road's washed out past the mill. You'll want the cliff path.
The chapel bell strikes the hour, a little late.
Footsteps echo on the steps that climb up from the water.
A cart rattles past loaded with barrels that smell of tar and salt.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Somewhere below, a bell buoy clanks in the swell.
Nets are drying on poles along the shingle, brown and stiff with salt.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
A cart rattles past loaded with barrels that smell of tar and salt.
Nets are drying on poles along the shingle, brown and stiff with salt.
Smoke from a dozen chimneys hangs low over the rooftops.
Gulls argue over a fish head on the harbour wall.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Ropes creak as the moored boats shift against the quay.
Washing snaps on a line strung between two windows.
Two fishwives laugh at something you did not hear.
A cart rattles past loaded with barrels that smell of tar and salt.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Footsteps echo on the steps that climb up from the water.
Old Bessa: My grandmother said the fog remembers every face it hides.
Lamplight spills from a doorway and is swallowed by the fog.
Washing snaps on a line strung between two windows.
Netmaker: Six days to make a net and one bad night to lose it.
A dog follows you for a while, then loses interest.
Old Bessa: My grandmother said the fog remembers every face it hides.
A man is mending a lobster pot with quick, scarred fingers.
The air tastes of coal smoke and seaweed.
Somewhere below, a bell buoy clanks in the swell.
Dockhand: Watch has been sniffing round the customs house all week.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Lamplight spills from a doorway and is swallowed by the fog.
A dog follows you for a while, then loses interest.
Ropes creak as the moored boats shift against the quay.
Corin: Slip's clear. Go.
Corin: Seen worse nights.
Corin: Got the line? Make it fast.
Corin: Owe you one for the warning back there.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_3

=== chapter_3_3 ===
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Footsteps echo on the steps that climb up from the water.
A cart rattles past loaded with barrels that smell of tar and salt.
Two fishwives laugh at something you did not hear.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
The chapel bell strikes the hour, a little late.
Netmaker: Six days to make a net and one bad night to lose it.
Somewhere below, a bell buoy clanks in the swell.
Dockhand: Watch has been sniffing round the customs house all week.
Gulls argue over a fish head on the harbour wall.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Somewhere below, a bell buoy clanks in the swell.
Dockhand: Watch has been sniffing round the customs house all week.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Dockhand: Watch has been sniffing round the customs house all week.
Two fishwives laugh at something you did not hear.
The tide has gone out a long way, and the mud shines like pewter.
A boy runs past with a basket of eels, shouting a price nobody pays.
The air tastes of coal smoke and seaweed.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Ropes creak as the moored boats shift against the quay.
Two fishwives laugh at something you did not hear.
A man is mending a lobster pot with quick, scarred fingers.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Dockhand: Watch has been sniffing round the customs house all week.
Ropes creak as the moored boats shift against the quay.
Smoke from a dozen chimneys hangs low over the rooftops.
Netmaker: Six days to make a net and one bad night to lose it.
A boy runs past with a basket of eels, shouting a price nobody pays.
Dockhand: Watch has been sniffing round the customs house all week.
A dog follows you for a while, then loses interest.
Footsteps echo on the steps that climb up from the water.
Two fishwives laugh at something you did not hear.
The cobbles are slick with last night's rain.
Nets are drying on poles along the shingle, brown and stiff with salt.
Corin: Not my business, mate.
Corin: Quiet. Voices carry.
Corin: Got the line? Make it fast.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_4

=== chapter_3_4 ===
A dog follows you for a while, then loses interest.
The light goes grey, then gold, then grey again as the clouds pass.
Ropes creak as the moored boats shift against the quay.
Smoke from a dozen chimneys hangs low over the rooftops.
The cobbles are slick with last night's rain.
Ropes creak as the moored boats shift against the quay.
The light goes grey, then gold, then grey again as the clouds pass.
The cobbles are slick with last night's rain.
A cat watches you from a windowsill without blinking.
Old Bessa: My grandmother said the fog remembers every face it hides.
Ropes creak as the moored boats shift against the quay.
Old Bessa: My grandmother said the fog remembers every face it hides.
Washing snaps on a line strung between two windows.
Gulls argue over a fish head on the harbour wall.
Two fishwives laugh at something you did not hear.
The light goes grey, then gold, then grey again as the clouds pass.
Smoke from a dozen chimneys hangs low over the rooftops.
The light goes grey, then gold, then grey again as the clouds pass.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Lamplight spills from a doorway and is swallowed by the fog.
Ropes creak as the moored boats shift against the quay.
A cart rattles past loaded with barrels that smell of tar and salt.
Lamplight spills from a doorway and is swallowed by the fog.
Gulls argue over a fish head on the harbour wall.
A cart rattles past loaded with barrels that smell of tar and salt.
Nets are drying on poles along the shingle, brown and stiff with salt.
Two fishwives laugh at something you did not hear.
Ropes creak as the moored boats shift against the quay.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
A cat watches you from a windowsill without blinking.
Old Bessa: My grandmother said the fog remembers every face it hides.
Ropes creak as the moored boats shift against the quay.
The chapel bell strikes the hour, a little late.
A cart rattles past loaded with barrels that smell of tar and salt.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Carter: Road's washed out past the mill. You'll want the cliff path.
Corin: Quiet. Voices carry.
Corin: Tide waits for nobody.
Corin: Tide waits for nobody.
~ corin_trust = 5
Corin trusts you completely now. He says so, twice, which is twice more than he says anything.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_5

=== chapter_3_5 ===
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Somewhere below, a bell buoy clanks in the swell.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Old Bessa: My grandmother said the fog remembers every face it hides.
A cat watches you from a windowsill without blinking.
A cart rattles past loaded with barrels that smell of tar and salt.
A dog follows you for a while, then loses interest.
A cat watches you from a windowsill without blinking.
Two fishwives laugh at something you did not hear.
The air tastes of coal smoke and seaweed.
A cart rattles past loaded with barrels that smell of tar and salt.
Lamplight spills from a doorway and is swallowed by the fog.
Lamplight spills from a doorway and is swallowed by the fog.
A boy runs past with a basket of eels, shouting a price nobody pays.
The chapel bell strikes the hour, a little late.
Footsteps echo on the steps that climb up from the water.
The air tastes of coal smoke and seaweed.
Netmaker: Six days to make a net and one bad night to lose it.
Priest: Walk carefully. The saints are busy this time of year.
Ropes creak as the moored boats shift against the quay.
The chapel bell strikes the hour, a little late.
A dog follows you for a while, then loses interest.
Lamplight spills from a doorway and is swallowed by the fog.
The tide has gone out a long way, and the mud shines like pewter.
Smoke from a dozen chimneys hangs low over the rooftops.
A boy runs past with a basket of eels, shouting a price nobody pays.
Two fishwives laugh at something you did not hear.
The tide has gone out a long way, and the mud shines like pewter.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Gulls argue over a fish head on the harbour wall.
The cobbles are slick with last night's rain.
Netmaker: Six days to make a net and one bad night to lose it.
The light goes grey, then gold, then grey again as the clouds pass.
A dog follows you for a while, then loses interest.
Corin: Got the line? Make it fast.
Corin: Got the line? Make it fast.
Corin: Slip's clear. Go.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_6

=== chapter_3_6 ===
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Dockhand: Watch has been sniffing round the customs house all week.
A dog follows you for a while, then loses interest.
Netmaker: Six days to make a net and one bad night to lose it.
The cobbles are slick with last night's rain.
The tide has gone out a long way, and the mud shines like pewter.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Footsteps echo on the steps that climb up from the water.
Gulls argue over a fish head on the harbour wall.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
A cat watches you from a windowsill without blinking.
Nets are drying on poles along the shingle, brown and stiff with salt.
Netmaker: Six days to make a net and one bad night to lose it.
Footsteps echo on the steps that climb up from the water.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
A dog follows you for a while, then loses interest.
Carter: Road's washed out past the mill. You'll want the cliff path.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Priest: Walk carefully. The saints are busy this time of year.
The light goes grey, then gold, then grey again as the clouds pass.
Ropes creak as the moored boats shift against the quay.
Footsteps echo on the steps that climb up from the water.
A dog follows you for a while, then loses interest.
A dog follows you for a while, then loses interest.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Old Bessa: My grandmother said the fog remembers every face it hides.
Gulls argue over a fish head on the harbour wall.
Lamplight spills from a doorway and is swallowed by the fog.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Netmaker: Six days to make a net and one bad night to lose it.
Smoke from a dozen chimneys hangs low over the rooftops.
The cobbles are slick with last night's rain.
The light goes grey, then gold, then grey again as the clouds pass.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Nets are drying on poles along the shingle, brown and stiff with salt.
Corin: Cargo first. Talk later.
Corin: Owe you one.
Corin: Not my business, mate.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_7

=== chapter_3_7 ===
A boy runs past with a basket of eels, shouting a price nobody pays.
The chapel bell strikes the hour, a little late.
Two fishwives laugh at something you did not hear.
Old Bessa: My grandmother said the fog remembers every face it hides.
Washing snaps on a line strung between two windows.
The cobbles are slick with last night's rain.
Nets are drying on poles along the shingle, brown and stiff with salt.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Ropes creak as the moored boats shift against the quay.
Somewhere below, a bell buoy clanks in the swell.
Nets are drying on poles along the shingle, brown and stiff with salt.
Nets are drying on poles along the shingle, brown and stiff with salt.
A cat watches you from a windowsill without blinking.
Two fishwives laugh at something you did not hear.
The light goes grey, then gold, then grey again as the clouds pass.
The air tastes of coal smoke and seaweed.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Smoke from a dozen chimneys hangs low over the rooftops.
Carter: Road's washed out past the mill. You'll want the cliff path.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Ropes creak as the moored boats shift against the quay.
Old Bessa: My grandmother said the fog remembers every face it hides.
Priest: Walk carefully. The saints are busy this time of year.
Two fishwives laugh at something you did not hear.
Smoke from a dozen chimneys hangs low over the rooftops.
The tide has gone out a long way, and the mud shines like pewter.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Netmaker: Six days to make a net and one bad night to lose it.
The light goes grey, then gold, then grey again as the clouds pass.
Ropes creak as the moored boats shift against the quay.
Dockhand: Watch has been sniffing round the customs house all week.
Nets are drying on poles along the shingle, brown and stiff with salt.
Footsteps echo on the steps that climb up from the water.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Lamplight spills from a doorway and is swallowed by the fog.
Corin: Got the line? Make it fast.
Corin: Hold her steady.
Corin: Cargo first. Talk later.
~ has_knife = false
The knife slips from your belt and is gone into the black water.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_8

=== chapter_3_8 ===
The cobbles are slick with last night's rain.
The air tastes of coal smoke and seaweed.
Dockhand: Watch has been sniffing round the customs house all week.
Gulls argue over a fish head on the harbour wall.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Ropes creak as the moored boats shift against the quay.
The cobbles are slick with last night's rain.
The light goes grey, then gold, then grey again as the clouds pass.
A cat watches you from a windowsill without blinking.
Priest: Walk carefully. The saints are busy this time of year.
A cat watches you from a windowsill without blinking.
Dockhand: Watch has been sniffing round the customs house all week.
Ropes creak as the moored boats shift against the quay.
Lamplight spills from a doorway and is swallowed by the fog.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Dockhand: Watch has been sniffing round the customs house all week.
The cobbles are slick with last night's rain.
A cat watches you from a windowsill without blinking.
A man is mending a lobster pot with quick, scarred fingers.
Somewhere below, a bell buoy clanks in the swell.
Dockhand: Watch has been sniffing round the customs house all week.
Two fishwives laugh at something you did not hear.
Dockhand: Watch has been sniffing round the customs house all week.
Washing snaps on a line strung between two windows.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Washing snaps on a line strung between two windows.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
A man is mending a lobster pot with quick, scarred fingers.
A dog follows you for a while, then loses interest.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Smoke from a dozen chimneys hangs low over the rooftops.
Washing snaps on a line strung between two windows.
Nets are drying on poles along the shingle, brown and stiff with salt.
Carter: Road's washed out past the mill. You'll want the cliff path.
Footsteps echo on the steps that climb up from the water.
A boy runs past with a basket of eels, shouting a price nobody pays.
Corin: Owe you one.
Corin: Tide waits for nobody.
Corin: Cargo first. Talk later.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_9

=== chapter_3_9 ===
The light goes grey, then gold, then grey again as the clouds pass.
A cat watches you from a windowsill without blinking.
Smoke from a dozen chimneys hangs low over the rooftops.
Somewhere below, a bell buoy clanks in the swell.
A dog follows you for a while, then loses interest.
The cobbles are slick with last night's rain.
Dockhand: Watch has been sniffing round the customs house all week.
Dockhand: Watch has been sniffing round the customs house all week.
Carter: Road's washed out past the mill. You'll want the cliff path.
Priest: Walk carefully. The saints are busy this time of year.
A cat watches you from a windowsill without blinking.
A boy runs past with a basket of eels, shouting a price nobody pays.
Old Bessa: My grandmother said the fog remembers every face it hides.
Lamplight spills from a doorway and is swallowed by the fog.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Nets are drying on poles along the shingle, brown and stiff with salt.
Ropes creak as the moored boats shift against the quay.
A cat watches you from a windowsill without blinking.
Lamplight spills from a doorway and is swallowed by the fog.
Somewhere below, a bell buoy clanks in the swell.
Lamplight spills from a doorway and is swallowed by the fog.
Carter: Road's washed out past the mill. You'll want the cliff path.
Washing snaps on a line strung between two windows.
A dog follows you for a while, then loses interest.
Gulls argue over a fish head on the harbour wall.
A cart rattles past loaded with barrels that smell of tar and salt.
The chapel bell strikes the hour, a little late.
The chapel bell strikes the hour, a little late.
The chapel bell strikes the hour, a little late.
Carter: Road's washed out past the mill. You'll want the cliff path.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
The air tastes of coal smoke and seaweed.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
The tide has gone out a long way, and the mud shines like pewter.
The cobbles are slick with last night's rain.
A man is mending a lobster pot with quick, scarred fingers.
Corin: Tide waits for nobody.
Corin: Hold her steady.
Corin: Hold her steady.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_10

=== chapter_3_10 ===
The light goes grey, then gold, then grey again as the clouds pass.
Dockhand: Watch has been sniffing round the customs house all week.
Lamplight spills from a doorway and is swallowed by the fog.
Somewhere below, a bell buoy clanks in the swell.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Washing snaps on a line strung between two windows.
Washing snaps on a line strung between two windows.
A cat watches you from a windowsill without blinking.
A man is mending a lobster pot with quick, scarred fingers.
The air tastes of coal smoke and seaweed.
The chapel bell strikes the hour, a little late.
Nets are drying on poles along the shingle, brown and stiff with salt.
Nets are drying on poles along the shingle, brown and stiff with salt.
Washing snaps on a line strung between two windows.
Smoke from a dozen chimneys hangs low over the rooftops.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Nets are drying on poles along the shingle, brown and stiff with salt.
Somewhere below, a bell buoy clanks in the swell.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
A boy runs past with a basket of eels, shouting a price nobody pays.
A man is mending a lobster pot with quick, scarred fingers.
The chapel bell strikes the hour, a little late.
Nets are drying on poles along the shingle, brown and stiff with salt.
The cobbles are slick with last night's rain.
A man is mending a lobster pot with quick, scarred fingers.
Washing snaps on a line strung between two windows.
A cart rattles past loaded with barrels that smell of tar and salt.
Ropes creak as the moored boats shift against the quay.
The chapel bell strikes the hour, a little late.
Gulls argue over a fish head on the harbour wall.
A cat watches you from a windowsill without blinking.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Netmaker: Six days to make a net and one bad night to lose it.
Somewhere below, a bell buoy clanks in the swell.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Corin: Not my business, mate.
Corin: Got the line? Make it fast.
Corin: Hold her steady.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_11

=== chapter_3_11 ===
The air tastes of coal smoke and seaweed.
Nets are drying on poles along the shingle, brown and stiff with salt.
Ropes creak as the moored boats shift against the quay.
Lamplight spills from a doorway and is swallowed by the fog.
Netmaker: Six days to make a net and one bad night to lose it.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Washing snaps on a line strung between two windows.
Ropes creak as the moored boats shift against the quay.
Gulls argue over a fish head on the harbour wall.
Carter: Road's washed out past the mill. You'll want the cliff path.
A cat watches you from a windowsill without blinking.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
The cobbles are slick with last night's rain.
Two fishwives laugh at something you did not hear.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Netmaker: Six days to make a net and one bad night to lose it.
A cart rattles past loaded with barrels that smell of tar and salt.
The cobbles are slick with last night's rain.
The chapel bell strikes the hour, a little late.
Old Bessa: My grandmother said the fog remembers every face it hides.
Washing snaps on a line strung between two windows.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The chapel bell strikes the hour, a little late.
A dog follows you for a while, then loses interest.
The chapel bell strikes the hour, a little late.
Netmaker: Six days to make a net and one bad night to lose it.
A dog follows you for a while, then loses interest.
The tide has gone out a long way, and the mud shines like pewter.
The light goes grey, then gold, then grey again as the clouds pass.
Two fishwives laugh at something you did not hear.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Footsteps echo on the steps that climb up from the water.
Carter: Road's washed out past the mill. You'll want the cliff path.
Footsteps echo on the steps that climb up from the water.
Footsteps echo on the steps that climb up from the water.
Corin: Tide waits for nobody.
Corin: Seen worse nights.
Corin: Mind the aft. Takes water.
Dockhand: Corin owes Mother Hask more than that boat is worth. Everyone on this shore knows it.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_12

=== chapter_3_12 ===
Ropes creak as the moored boats shift against the quay.
The chapel bell strikes the hour, a little late.
Washing snaps on a line strung between two windows.
The light goes grey, then gold, then grey again as the clouds pass.
Old Bessa: My grandmother said the fog remembers every face it hides.
A man is mending a lobster pot with quick, scarred fingers.
Old Bessa: My grandmother said the fog remembers every face it hides.
The chapel bell strikes the hour, a little late.
A cart rattles past loaded with barrels that smell of tar and salt.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Smoke from a dozen chimneys hangs low over the rooftops.
Footsteps echo on the steps that climb up from the water.
Nets are drying on poles along the shingle, brown and stiff with salt.
Gulls argue over a fish head on the harbour wall.
Priest: Walk carefully. The saints are busy this time of year.
Carter: Road's washed out past the mill. You'll want the cliff path.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
The chapel bell strikes the hour, a little late.
A man is mending a lobster pot with quick, scarred fingers.
The chapel bell strikes the hour, a little late.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Priest: Walk carefully. The saints are busy this time of year.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
The air tastes of coal smoke and seaweed.
A boy runs past with a basket of eels, shouting a price nobody pays.
Carter: Road's washed out past the mill. You'll want the cliff path.
Ropes creak as the moored boats shift against the quay.
The chapel bell strikes the hour, a little late.
The tide has gone out a long way, and the mud shines like pewter.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Two fishwives laugh at something you did not hear.
Carter: Road's washed out past the mill. You'll want the cliff path.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Old Bessa: My grandmother said the fog remembers every face it hides.
A cat watches you from a windowsill without blinking.
Corin: Cargo first. Talk later.
Corin: Cargo first. Talk later.
Corin: Not my business, mate.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_13

=== chapter_3_13 ===
Ropes creak as the moored boats shift against the quay.
The tide has gone out a long way, and the mud shines like pewter.
A cat watches you from a windowsill without blinking.
Old Bessa: My grandmother said the fog remembers every face it hides.
The tide has gone out a long way, and the mud shines like pewter.
A boy runs past with a basket of eels, shouting a price nobody pays.
Nets are drying on poles along the shingle, brown and stiff with salt.
Somewhere below, a bell buoy clanks in the swell.
The air tastes of coal smoke and seaweed.
A man is mending a lobster pot with quick, scarred fingers.
Gulls argue over a fish head on the harbour wall.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
The chapel bell strikes the hour, a little late.
The light goes grey, then gold, then grey again as the clouds pass.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Two fishwives laugh at something you did not hear.
The chapel bell strikes the hour, a little late.
The light goes grey, then gold, then grey again as the clouds pass.
The air tastes of coal smoke and seaweed.
A dog follows you for a while, then loses interest.
The light goes grey, then gold, then grey again as the clouds pass.
Nets are drying on poles along the shingle, brown and stiff with salt.
Washing snaps on a line strung between two windows.
Smoke from a dozen chimneys hangs low over the rooftops.
Netmaker: Six days to make a net and one bad night to lose it.
Carter: Road's washed out past the mill. You'll want the cliff path.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Washing snaps on a line strung between two windows.
A man is mending a lobster pot with quick, scarred fingers.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
A cart rattles past loaded with barrels that smell of tar and salt.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
A cart rattles past loaded with barrels that smell of tar and salt.
Corin: Owe you one.
Corin: Keep low. Wind's turning.
Corin: Mind the aft. Takes water.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_14

=== chapter_3_14 ===
Two fishwives laugh at something you did not hear.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Old Bessa: My grandmother said the fog remembers every face it hides.
A cart rattles past loaded with barrels that smell of tar and salt.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Smoke from a dozen chimneys hangs low over the rooftops.
Priest: Walk carefully. The saints are busy this time of year.
The light goes grey, then gold, then grey again as the clouds pass.
Dockhand: Watch has been sniffing round the customs house all week.
The light goes grey, then gold, then grey again as the clouds pass.
Ropes creak as the moored boats shift against the quay.
The cobbles are slick with last night's rain.
Priest: Walk carefully. The saints are busy this time of year.
Netmaker: Six days to make a net and one bad night to lose it.
Lamplight spills from a doorway and is swallowed by the fog.
The cobbles are slick with last night's rain.
Smoke from a dozen chimneys hangs low over the rooftops.
Ropes creak as the moored boats shift against the quay.
Somewhere below, a bell buoy clanks in the swell.
A man is mending a lobster pot with quick, scarred fingers.
Priest: Walk carefully. The saints are busy this time of year.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Ropes creak as the moored boats shift against the quay.
A dog follows you for a while, then loses interest.
A boy runs past with a basket of eels, shouting a price nobody pays.
The light goes grey, then gold, then grey again as the clouds pass.
Priest: Walk carefully. The saints are busy this time of year.
The light goes grey, then gold, then grey again as the clouds pass.
The air tastes of coal smoke and seaweed.
A man is mending a lobster pot with quick, scarred fingers.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Smoke from a dozen chimneys hangs low over the rooftops.
A man is mending a lobster pot with quick, scarred fingers.
Nets are drying on poles along the shingle, brown and stiff with salt.
Corin: Cargo first. Talk later.
Corin: Mind the aft. Takes water.
Corin: Touch wood.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_15

=== chapter_3_15 ===
The tide has gone out a long way, and the mud shines like pewter.
Footsteps echo on the steps that climb up from the water.
A dog follows you for a while, then loses interest.
Carter: Road's washed out past the mill. You'll want the cliff path.
Priest: Walk carefully. The saints are busy this time of year.
Smoke from a dozen chimneys hangs low over the rooftops.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Somewhere below, a bell buoy clanks in the swell.
A man is mending a lobster pot with quick, scarred fingers.
Somewhere below, a bell buoy clanks in the swell.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
The chapel bell strikes the hour, a little late.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Netmaker: Six days to make a net and one bad night to lose it.
The air tastes of coal smoke and seaweed.
Washing snaps on a line strung between two windows.
Nets are drying on poles along the shingle, brown and stiff with salt.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Washing snaps on a line strung between two windows.
Somewhere below, a bell buoy clanks in the swell.
A cart rattles past loaded with barrels that smell of tar and salt.
The air tastes of coal smoke and seaweed.
Smoke from a dozen chimneys hangs low over the rooftops.
Netmaker: Six days to make a net and one bad night to lose it.
Netmaker: Six days to make a net and one bad night to lose it.
A man is mending a lobster pot with quick, scarred fingers.
Two fishwives laugh at something you did not hear.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
A boy runs past with a basket of eels, shouting a price nobody pays.
Smoke from a dozen chimneys hangs low over the rooftops.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Ropes creak as the moored boats shift against the quay.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Priest: Walk carefully. The saints are busy this time of year.
Corin: Touch wood.
Corin: Quiet. Voices carry.
Corin: Owe you one.
~ lied_name = false
You tell Corin your real name at last. He only nods.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_16

=== chapter_3_16 ===
The air tastes of coal smoke and seaweed.
Carter: Road's washed out past the mill. You'll want the cliff path.
Two fishwives laugh at something you did not hear.
A cart rattles past loaded with barrels that smell of tar and salt.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Ropes creak as the moored boats shift against the quay.
A man is mending a lobster pot with quick, scarred fingers.
Lamplight spills from a doorway and is swallowed by the fog.
The chapel bell strikes the hour, a little late.
A cart rattles past loaded with barrels that smell of tar and salt.
Dockhand: Watch has been sniffing round the customs house all week.
Two fishwives laugh at something you did not hear.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Netmaker: Six days to make a net and one bad night to lose it.
Priest: Walk carefully. The saints are busy this time of year.
Nets are drying on poles along the shingle, brown and stiff with salt.
Ropes creak as the moored boats shift against the quay.
The tide has gone out a long way, and the mud shines like pewter.
Carter: Road's washed out past the mill. You'll want the cliff path.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
A dog follows you for a while, then loses interest.
A boy runs past with a basket of eels, shouting a price nobody pays.
Ropes creak as the moored boats shift against the quay.
Footsteps echo on the steps that climb up from the water.
Ropes creak as the moored boats shift against the quay.
Ropes creak as the moored boats shift against the quay.
The tide has gone out a long way, and the mud shines like pewter.
Footsteps echo on the steps that climb up from the water.
The light goes grey, then gold, then grey again as the clouds pass.
A dog follows you for a while, then loses interest.
Ropes creak as the moored boats shift against the quay.
The chapel bell strikes the hour, a little late.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Lamplight spills from a doorway and is swallowed by the fog.
Gulls argue over a fish head on the harbour wall.
Corin: Quiet. Voices carry.
Corin: Cargo first. Talk later.
Corin: Cargo first. Talk later.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_17

=== chapter_3_17 ===
A dog follows you for a while, then loses interest.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Netmaker: Six days to make a net and one bad night to lose it.
A man is mending a lobster pot with quick, scarred fingers.
A cart rattles past loaded with barrels that smell of tar and salt.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Smoke from a dozen chimneys hangs low over the rooftops.
Old Bessa: My grandmother said the fog remembers every face it hides.
Gulls argue over a fish head on the harbour wall.
The light goes grey, then gold, then grey again as the clouds pass.
Somewhere below, a bell buoy clanks in the swell.
Lamplight spills from a doorway and is swallowed by the fog.
Dockhand: Watch has been sniffing round the customs house all week.
The chapel bell strikes the hour, a little late.
A cart rattles past loaded with barrels that smell of tar and salt.
The light goes grey, then gold, then grey again as the clouds pass.
Somewhere below, a bell buoy clanks in the swell.
A boy runs past with a basket of eels, shouting a price nobody pays.
Footsteps echo on the steps that climb up from the water.
Dockhand: Watch has been sniffing round the customs house all week.
Two fishwives laugh at something you did not hear.
Lamplight spills from a doorway and is swallowed by the fog.
Smoke from a dozen chimneys hangs low over the rooftops.
Somewhere below, a bell buoy clanks in the swell.
Old Bessa: My grandmother said the fog remembers every face it hides.
Dockhand: Watch has been sniffing round the customs house all week.
Footsteps echo on the steps that climb up from the water.
Washing snaps on a line strung between two windows.
A man is mending a lobster pot with quick, scarred fingers.
The light goes grey, then gold, then grey again as the clouds pass.
Washing snaps on a line strung between two windows.
A cart rattles past loaded with barrels that smell of tar and salt.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Dockhand: Watch has been sniffing round the customs house all week.
Lamplight spills from a doorway and is swallowed by the fog.
Somewhere below, a bell buoy clanks in the swell.
Corin: Cargo first. Talk later.
Corin: Keep low. Wind's turning.
Corin: Seen worse nights.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_18

=== chapter_3_18 ===
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
The air tastes of coal smoke and seaweed.
Priest: Walk carefully. The saints are busy this time of year.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Somewhere below, a bell buoy clanks in the swell.
Dockhand: Watch has been sniffing round the customs house all week.
Footsteps echo on the steps that climb up from the water.
Gulls argue over a fish head on the harbour wall.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
A cart rattles past loaded with barrels that smell of tar and salt.
Priest: Walk carefully. The saints are busy this time of year.
Footsteps echo on the steps that climb up from the water.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
A cat watches you from a windowsill without blinking.
Nets are drying on poles along the shingle, brown and stiff with salt.
A dog follows you for a while, then loses interest.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Smoke from a dozen chimneys hangs low over the rooftops.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Ropes creak as the moored boats shift against the quay.
Lamplight spills from a doorway and is swallowed by the fog.
Somewhere below, a bell buoy clanks in the swell.
The chapel bell strikes the hour, a little late.
Ropes creak as the moored boats shift against the quay.
Nets are drying on poles along the shingle, brown and stiff with salt.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Ropes creak as the moored boats shift against the quay.
The chapel bell strikes the hour, a little late.
The light goes grey, then gold, then grey again as the clouds pass.
Smoke from a dozen chimneys hangs low over the rooftops.
Two fishwives laugh at something you did not hear.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Corin: Quiet. Voices carry.
Corin: Slip's clear. Go.
Corin: Cargo first. Talk later.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_19

=== chapter_3_19 ===
Footsteps echo on the steps that climb up from the water.
Gulls argue over a fish head on the harbour wall.
Netmaker: Six days to make a net and one bad night to lose it.
The cobbles are slick with last night's rain.
Washing snaps on a line strung between two windows.
Carter: Road's washed out past the mill. You'll want the cliff path.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Washing snaps on a line strung between two windows.
Dockhand: Watch has been sniffing round the customs house all week.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
The chapel bell strikes the hour, a little late.
Carter: Road's washed out past the mill. You'll want the cliff path.
Lamplight spills from a doorway and is swallowed by the fog.
A boy runs past with a basket of eels, shouting a price nobody pays.
Gulls argue over a fish head on the harbour wall.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Old Bessa: My grandmother said the fog remembers every face it hides.
Smoke from a dozen chimneys hangs low over the rooftops.
Smoke from a dozen chimneys hangs low over the rooftops.
Nets are drying on poles along the shingle, brown and stiff with salt.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Priest: Walk carefully. The saints are busy this time of year.
The cobbles are slick with last night's rain.
Two fishwives laugh at something you did not hear.
Ropes creak as the moored boats shift against the quay.
The tide has gone out a long way, and the mud shines like pewter.
Somewhere below, a bell buoy clanks in the swell.
A dog follows you for a while, then loses interest.
Footsteps echo on the steps that climb up from the water.
Smoke from a dozen chimneys hangs low over the rooftops.
Somewhere below, a bell buoy clanks in the swell.
Ropes creak as the moored boats shift against the quay.
Two fishwives laugh at something you did not hear.
Ropes creak as the moored boats shift against the quay.
Old Bessa: My grandmother said the fog remembers every face it hides.
The cobbles are slick with last night's rain.
Corin: Not my business, mate.
Corin: Owe you one.
Corin: Got the line? Make it fast.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_20

=== chapter_3_20 ===
Dockhand: Watch has been sniffing round the customs house all week.
Nets are drying on poles along the shingle, brown and stiff with salt.
Priest: Walk carefully. The saints are busy this time of year.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The tide has gone out a long way, and the mud shines like pewter.
Old Bessa: My grandmother said the fog remembers every face it hides.
A cat watches you from a windowsill without blinking.
Somewhere below, a bell buoy clanks in the swell.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Lamplight spills from a doorway and is swallowed by the fog.
The light goes grey, then gold, then grey again as the clouds pass.
Netmaker: Six days to make a net and one bad night to lose it.
Footsteps echo on the steps that climb up from the water.
A cat watches you from a windowsill without blinking.
Washing snaps on a line strung between two windows.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The cobbles are slick with last night's rain.
A man is mending a lobster pot with quick, scarred fingers.
The air tastes of coal smoke and seaweed.
A boy runs past with a basket of eels, shouting a price nobody pays.
Gulls argue over a fish head on the harbour wall.
Washing snaps on a line strung between two windows.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Gulls argue over a fish head on the harbour wall.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Smoke from a dozen chimneys hangs low over the rooftops.
A cart rattles past loaded with barrels that smell of tar and salt.
A cat watches you from a windowsill without blinking.
The cobbles are slick with last night's rain.
Old Bessa: My grandmother said the fog remembers every face it hides.
A dog follows you for a while, then loses interest.
Dockhand: Watch has been sniffing round the customs house all week.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The cobbles are slick with last night's rain.
Corin: Hold her steady.
Corin: Cargo first. Talk later.
Corin: Touch wood.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_21

=== chapter_3_21 ===
Two fishwives laugh at something you did not hear.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
The air tastes of coal smoke and seaweed.
Somewhere below, a bell buoy clanks in the swell.
The chapel bell strikes the hour, a little late.
A cat watches you from a windowsill without blinking.
Two fishwives laugh at something you did not hear.
Two fishwives laugh at something you did not hear.
Carter: Road's washed out past the mill. You'll want the cliff path.
Priest: Walk carefully. The saints are busy this time of year.
Washing snaps on a line strung between two windows.
The chapel bell strikes the hour, a little late.
Ropes creak as the moored boats shift against the quay.
Nets are drying on poles along the shingle, brown and stiff with salt.
A man is mending a lobster pot with quick, scarred fingers.
The chapel bell strikes the hour, a little late.
The light goes grey, then gold, then grey again as the clouds pass.
The light goes grey, then gold, then grey again as the clouds pass.
Somewhere below, a bell buoy clanks in the swell.
The air tastes of coal smoke and seaweed.
Dockhand: Watch has been sniffing round the customs house all week.
The cobbles are slick with last night's rain.
Dockhand: Watch has been sniffing round the customs house all week.
Gulls argue over a fish head on the harbour wall.
Nets are drying on poles along the shingle, brown and stiff with salt.
Netmaker: Six days to make a net and one bad night to lose it.
A cart rattles past loaded with barrels that smell of tar and salt.
A cat watches you from a windowsill without blinking.
Lamplight spills from a doorway and is swallowed by the fog.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
A cat watches you from a windowsill without blinking.
The cobbles are slick with last night's rain.
Washing snaps on a line strung between two windows.
The air tastes of coal smoke and seaweed.
Washing snaps on a line strung between two windows.
Corin: Cargo first. Talk later.
Corin: Slip's clear. Go.
Corin: Hold her steady.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_22

=== chapter_3_22 ===
Washing snaps on a line strung between two windows.
Ropes creak as the moored boats shift against the quay.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The tide has gone out a long way, and the mud shines like pewter.
Two fishwives laugh at something you did not hear.
Gulls argue over a fish head on the harbour wall.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Footsteps echo on the steps that climb up from the water.
Two fishwives laugh at something you did not hear.
The light goes grey, then gold, then grey again as the clouds pass.
The chapel bell strikes the hour, a little late.
A cart rattles past loaded with barrels that smell of tar and salt.
Lamplight spills from a doorway and is swallowed by the fog.
Ropes creak as the moored boats shift against the quay.
The cobbles are slick with last night's rain.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
The cobbles are slick with last night's rain.
Dockhand: Watch has been sniffing round the customs house all week.
Carter: Road's washed out past the mill. You'll want the cliff path.
Carter: Road's washed out past the mill. You'll want the cliff path.
The tide has gone out a long way, and the mud shines like pewter.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
The air tastes of coal smoke and seaweed.
Ropes creak as the moored boats shift against the quay.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Nets are drying on poles along the shingle, brown and stiff with salt.
A dog follows you for a while, then loses interest.
The cobbles are slick with last night's rain.
Old Bessa: My grandmother said the fog remembers every face it hides.
Netmaker: Six days to make a net and one bad night to lose it.
Smoke from a dozen chimneys hangs low over the rooftops.
Carter: Road's washed out past the mill. You'll want the cliff path.
Gulls argue over a fish head on the harbour wall.
Netmaker: Six days to make a net and one bad night to lose it.
Corin: Got the line? Make it fast.
Corin: Mind the aft. Takes water.
Corin: Owe you one.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_23

=== chapter_3_23 ===
Two fishwives laugh at something you did not hear.
Footsteps echo on the steps that climb up from the water.
Priest: Walk carefully. The saints are busy this time of year.
Washing snaps on a line strung between two windows.
The cobbles are slick with last night's rain.
A man is mending a lobster pot with quick, scarred fingers.
A boy runs past with a basket of eels, shouting a price nobody pays.
The air tastes of coal smoke and seaweed.
Nets are drying on poles along the shingle, brown and stiff with salt.
A cart rattles past loaded with barrels that smell of tar and salt.
Ropes creak as the moored boats shift against the quay.
Two fishwives laugh at something you did not hear.
The light goes grey, then gold, then grey again as the clouds pass.
Lamplight spills from a doorway and is swallowed by the fog.
A dog follows you for a while, then loses interest.
Dockhand: Watch has been sniffing round the customs house all week.
Nets are drying on poles along the shingle, brown and stiff with salt.
Old Bessa: My grandmother said the fog remembers every face it hides.
A boy runs past with a basket of eels, shouting a price nobody pays.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
Netmaker: Six days to make a net and one bad night to lose it.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Priest: Walk carefully. The saints are busy this time of year.
Lamplight spills from a doorway and is swallowed by the fog.
Old Bessa: My grandmother said the fog remembers every face it hides.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
Smoke from a dozen chimneys hangs low over the rooftops.
Priest: Walk carefully. The saints are busy this time of year.
A cart rattles past loaded with barrels that smell of tar and salt.
A boy runs past with a basket of eels, shouting a price nobody pays.
Chandler: Rope, tar, lamp oil. Anything else is not my business.
The air tastes of coal smoke and seaweed.
The road bends along the cliffs, and the wind comes in off the water in long cold breaths.
The tide has gone out a long way, and the mud shines like pewter.
Priest: Walk carefully. The saints are busy this time of year.
Corin: Slip's clear. Go.
Corin: Mind the aft. Takes water.
Corin: Quiet. Voices carry.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> chapter_3_24

=== chapter_3_24 ===
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Innkeeper: Room's a shilling, supper's another, and the fleas are free.
Ropes creak as the moored boats shift against the quay.
Two fishwives laugh at something you did not hear.
Nets are drying on poles along the shingle, brown and stiff with salt.
The air tastes of coal smoke and seaweed.
Nets are drying on poles along the shingle, brown and stiff with salt.
Lamplight spills from a doorway and is swallowed by the fog.
A boy runs past with a basket of eels, shouting a price nobody pays.
Netmaker: Six days to make a net and one bad night to lose it.
A cart rattles past loaded with barrels that smell of tar and salt.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
A cat watches you from a windowsill without blinking.
Smoke from a dozen chimneys hangs low over the rooftops.
Smoke from a dozen chimneys hangs low over the rooftops.
Netmaker: Six days to make a net and one bad night to lose it.
Harbourmaster: Papers, if you have them. If you do not, I never saw you.
A cart rattles past loaded with barrels that smell of tar and salt.
Smoke from a dozen chimneys hangs low over the rooftops.
The light goes grey, then gold, then grey again as the clouds pass.
Two fishwives laugh at something you did not hear.
A dog follows you for a while, then loses interest.
The light goes grey, then gold, then grey again as the clouds pass.
Footsteps echo on the steps that climb up from the water.
Fishwife: Mind your boots, love, the steps are treacherous after rain.
Child: Are you a smuggler? My uncle is a smuggler. Do not tell.
Somewhere below, a bell buoy clanks in the swell.
A boy runs past with a basket of eels, shouting a price nobody pays.
A cart rattles past loaded with barrels that smell of tar and salt.
Two fishwives laugh at something you did not hear.
The cobbles are slick with last night's rain.
The tide has gone out a long way, and the mud shines like pewter.
Lamplight spills from a doorway and is swallowed by the fog.
Footsteps echo on the steps that climb up from the water.
Nets are drying on poles along the shingle, brown and stiff with salt.
Old Bessa: My grandmother said the fog remembers every face it hides.
Corin: Hold her steady.
Corin: Cargo first. Talk later.
Corin: Touch wood.
* [Keep walking]
    You keep walking.
* [Stop and look back]
    You stop and look back at the water.
- -> END
