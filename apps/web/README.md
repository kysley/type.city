# animated cursors
  - like stranges from tf2
  - big for multiplayer

# userbars
  - [] add support
    - show on profile
  - [] unlocks


# combo
  - spacebar is combo meter
  - color/fill depending on multiplier?
  -

# performance
  - cache word list every time the line breaks change

# todo
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
- [x] fix initial cursor position
  - [x] this happens because elements above/below the word box move it and the cursor isn't aligned
  - fixed with grid
- [x] backspace words that are incorrect
- [] word-type system
- [x] apm scoring system - all actions instead of standard wpm
  - [] is it accurate?
- [] cursor unlocking
- [] cursor selection ui

# mp
- [] cursor simulation. go for word idx+ letter idx regardless of where that word is on the users view
- [x] turborepo with backend
- [x] socketio rooms per game
- [x] transmit updates
- [] add metadata about the player
  - cursor
    - match local cursor size, apply style (solid, etc)
    - show other cursors after a second or two to avoid noise
- [] queue system
  - put players in queue
  - 1 + 1 = new room created
    - <next player queue> look for unstarted room
    - repeat
- [] end of game let players type COMPLIMENTS (gg, that was fun) to send after game messages.
  - play again
  - rematch

The backspacing system includes the space you "typed" to type the next word. This may be different than how other sites do it.. When your cursor is at the start of a word and the previous word is incomplete or incorrect, you are able to go back and type from where you left off.


# word types
