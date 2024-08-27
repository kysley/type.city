# Cursors
  - like stranges from tf2
  - big for multiplayer
  - [ ] party hats
  - [ ] styles
    - [ ] skinny, solid, underline

# Userbars
  - [ ] show on profile
  - [ ] unlocks
  - [ ] select user bar
  - [ ] show user bar in ui somewhere?

# Unlocks
  - userbar and cursor packages
  - [chests](#chest)

# Combos
  - a stylized spacebar is the combo meter
  - color/fill depending on multiplier?

# Performance
  - [ ] cache word list every time the line breaks change

# TODO
- [ ] word-type system
- [ ] server AND client helpers to determine state, what can/can't be done
- [ ] fix APM for other gamemodes
- [ ] cursor unlocking
- [ ] cursor style (underline, block), probably doesnt matter for custom cursors
  - [ ] when idle non custom cursors are animated
- [ ] fix cursor position when backspacing between top and middle lines

# Singleplayer
```ts
(cookie user);
type GameResult = {
  mode: GameMode;
  condition: number;
  state: WordState[];

  //
  wordIndex: number;
  // apm: number;
  wpm: number;
  accuracy: number;
}

// Maybe recreate wpm, apm, wordIndex.. based on state and validate user submitted values

```

# Multiplayer
- [ ] sync client on room restart
- [ ] create a new room
  - [ ] mode, condition
  - [ ] going to have to capture some of this in atoms?
  - [ ] limited to premium
- [ ] some sort of anticheat
- [ ] send string of words
- [ ] add metadata about the player
  - userbar
    - [x] add userbar
  - cursor
    - [x] add cursor
    - [ ] match local cursor size, apply style (solid, etc)
    - [ ] show other cursors after a second or two to avoid noise
- [ ] queue system
  - put players in queue
  - 1 + 1 = new room created
    - <next player queue> look for unstarted room
    - repeat
- [ ] end of game let players type COMPLIMENTS (gg, that was fun) to send after game messages.
  - "play again"
  - "rematch"


---

The backspacing system includes the space you "typed" to type the next word. This may be different than how other sites do it.. When your cursor is at the start of a word and the previous word is incomplete or incorrect, you are able to go back and type from where you left off.

# Word States
- correct: by the end, the word was correct when space was hit
- flawless: word was typed correctly without backspaces
- incorrect: word was typed incorrectly when space was hit
- unfinished: word was started but not finished- likely when current word

# Word Types

### Chest
typing a Chest word flawlessly allows the user to open it once the test has finished.

### Fog
A Fog word does not reveal the next letter until the previous is typed.

### Stainless
A Stainless word does not reveal the state of any letters typed.

### Brittle
A Brittle word will "break" and not allow the user to return to it or continue typing if a letter is incorrect.

### Shielded
A Shielded word needs to be typed twice successfully in order to move to the next word.




#### Deploying
1. Update Caddy server to see the port ie: `reverse_proxy /type* http://localhost:8000`
   1. `type` here is the 'namespace' for the server since it lives alongside many other localhost services
   2. Making use of rewriteUrl here to fix ugly urls on the FE
   3. THEN RELOAD THE CADDY SERVER!
2. The socket server should share the same prefix in code
   1. /type/s
      1. `s` for socket. Probably can collide but whatever
   2. Frontend needs to match path (/type/s) and port (8000) manually in the socketio options
      1. Having the port in the URI ie. http://localhost:8000 is ignored
