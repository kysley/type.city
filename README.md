# Animated Cursors
  - like stranges from tf2
  - big for multiplayer

# Userbars
  - [] add support
    - show on profile
  - [] unlocks

# Unlocks
  - userbar and cursor packages
  - [chests](#chest)

# Combos
  - spacebar is combo meter
  - color/fill depending on multiplier?

# Performance
  - [] cache word list every time the line breaks change
  - [x] hide words beyond 3 lines out - similar to what we check in word list.
    - [x] keep track of that index?

# TODO
- [x] fix word scrolling breaking after many lines. easy to reproduce on small width.
  - looks like there are too many lines being hidden?
- [] make url's env var
- [x] animated cursor poc
- [x] keep track of word state
- [x] update input with that of previous, incomplete word
- [x] fix cursor position on reset
- [x?] add time and duration as game types
- [x] end game screen
  - [x] stats
  - [] retry
  - [x] new test
- [] fix cursor position when backspacing between top and middle lines
- [x] letter highlighting incorrect when <last letter> + space
- [x] fix initial cursor position
  - [x] this happens because elements above/below the word box move it and the cursor isn't aligned
  - fixed with grid
- [x] backspace words that are incorrect
- [] word-type system
  - [] server AND client helpers to determine state, what can/can't be done
- [x] apm scoring system - all actions instead of standard wpm
  - [] is it accurate?
- [] cursor unlocking
- [x] shit cursor selection ui
- [ ] cursor style (underline, block), probably doesnt matter for custom cursors

# Multiplayer
- [x] cursor simulation. go for word idx+ letter idx regardless of where that word is on the users view
  - so far so good
- [x] give users of a room the same words
- [x] turborepo with backend
- [x] socketio rooms per game
- [x] transmit updates
- [x] all 'socket' usage should be io from app.io
- [ ] control the game lifecycle on the server
  - [x] game start
  - [x] game end
  - [ ] reset/play again (voting?)
  - [ ] total results
  - [ ] some sort of anticheat
  - [x] fix game starting twice due to timeouts
- [x?] fix socket connection being spotty?
- [] add metadata about the player
  - userbar
    - [x] add userbar
  - cursor
    - [x] add cursor
    - [] match local cursor size, apply style (solid, etc)
    - [] show other cursors after a second or two to avoid noise
- [] queue system
  - put players in queue
  - 1 + 1 = new room created
    - <next player queue> look for unstarted room
    - repeat
- [] end of game let players type COMPLIMENTS (gg, that was fun) to send after game messages.
  - play again
  - rematch

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
