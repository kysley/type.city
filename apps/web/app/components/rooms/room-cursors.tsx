import { useAtomValue } from "jotai";
import { Fragment, RefObject } from "react";
import { hideWordsOverIndexAtom, hideWordsUnderIndexAtom } from "../../state";
import { Box } from "@wwwares/ui-system/jsx";
import { useRoomPlayers } from "../../hooks/use-room-player";
import { cursorLookup } from "../../utils/cursors";

type RoomCursorsProps = {
  container: RefObject<HTMLDivElement>;
};
function RoomCursors({ container }: RoomCursorsProps) {
  const { players } = useRoomPlayers({ includeSelf: false });
  const hideUnder = useAtomValue(hideWordsUnderIndexAtom);
  const { cursorLimit } = useAtomValue(hideWordsOverIndexAtom);

  const cPos = players
    // filter out cursors which aren't visible on the client
    ?.filter(
      (player) =>
        player.wordIndex <= cursorLimit && player.wordIndex >= hideUnder
    )
    .map((player) => {
      if (!container) return;
      const word = container.current?.children.item(player.wordIndex);
      if (!word) {
        return {
          y: 0,
          x: 0,
          id: player.id,
        };
      }

      const vec = [];

      // the player has some typing mistakes
      const isLastLetter = player.letterIndex > word.children.length - 1;

      // Lock cursor to end of word if player has extra letters
      const letter = word.children.item(
        isLastLetter ? word.children.length - 1 : player.letterIndex
      );

      // There can be no letter if the cursor is simulated on a word that the user hasn't reached yet
      // <span>the full word</span> -> <span><letter elements></span>
      if (!letter || word.children.length === 0) {
        // 20px is best estimate for fat cursor based on hard coded settings
        // will need to adjust this for cursor model/ local size
        vec[0] = word.offsetLeft + player.letterIndex * 20;
        vec[1] = word.offsetTop;
      } else {
        vec[0] = letter.offsetLeft;
        vec[1] = letter.offsetTop;
      }
      return {
        cId: player.cursorId,
        id: player.id,
        x: vec[0],
        y: vec[1],
      };
    });

  if (!players.length) {
    return null;
  }

  return (
    <Fragment>
      {cPos.map((pos) => (
        <Box
          key={pos.id}
          position="absolute"
          height="8"
          width="2"
          className={`caret remote caret${pos?.cId}`}
          opacity={0.5}
          style={{
            left: pos.x,
            top: pos.y,
            marginTop: 4,
          }}
          // style={{ transform: `translate(${pos[0]}px, ${pos[1]}px)`, marginTop: 4 }}
        />
      ))}
    </Fragment>
  );
}

export { RoomCursors, type RoomCursorsProps };
