// Example scene: the inn.
// Three paths lead into `cellar`, each leaving different facts behind.
// Write `cellar`. Tamsin's voice is declared in inn.voices.md.

VAR tamsin_trust = 0           // How Tamsin feels about the player: -1 annoyed with them, 0 neutral, 2 trusts them.
VAR fought_drunk = false        // The player fought off a drunk who grabbed Tamsin.
VAR posing_as_inspector = false // Tamsin believes the player is a royal inspector.
VAR owes_coin = false          // The player could not pay and still owes for supper.

-> common_room

=== common_room ===
The Drowned Bell is loud, warm, and smells of wet dogs. Tamsin, the innkeeper's daughter, is carrying four tankards at once and talking to six people.
Tamsin: Sit anywhere that isn't on fire, and if it is on fire, aye, tell me, because that happened Tuesday and nobody said a word.
* [Step in when a drunk grabs her arm]
    -> drunk
* [Tell her you are a royal inspector, to get a better room]
    -> inspector
* [Admit you cannot pay for supper]
    -> debt

=== drunk ===
A man twice your width catches Tamsin by the wrist. You put yourself between them, and after a short, ugly scuffle he is out in the rain.
~ fought_drunk = true
~ tamsin_trust = 2
Later she brings you supper and sits down without being asked.
Tamsin: I'm going to leave, you know. Not tonight. But soon, and proper, with a horse and everything, and you're the first one I've told, so don't go telling the fish.
-> cellar

=== inspector ===
You show her a seal you bought at a market stall. Her face goes pale.
~ posing_as_inspector = true
Tamsin: An inspector. Here. Of course you are, why wouldn't you be, Father's going to have kittens. The best room, aye, straight away, sir.
She calls you sir three more times before you reach the stairs.
-> cellar

=== debt ===
Tamsin listens to your excuse with her arms folded.
~ owes_coin = true
~ tamsin_trust = -1
Tamsin: No coin. Grand. Lovely. You can wash every pot in that kitchen, then, and if you break one you're paying for that too, in coin you haven't got.
You wash pots until midnight.
-> cellar

=== cellar ===
// Write this scene.
// Riders arrive and start breaking down the front door. Tamsin drags you down into the cellar to hide.
-> END
