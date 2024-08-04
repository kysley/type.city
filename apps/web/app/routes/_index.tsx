import type { MetaFunction } from "@remix-run/node";
import { GameState, gStateAtom, wordsAtomAtom } from "../state";
import { WordComposition } from "../components/word-list";
import { ClientOnly } from "remix-utils/client-only";
import { Fragment } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useSyncInput } from "../hooks/use-sync-input";
import { GameDebug } from "../components/game-info";
import { useGameSync } from "../hooks/use-game-sync";
import { RoomPlayerList } from "../components/rooms/player-list";
import { LocalGameEndScreen } from "../components/local-game-end-screen";
import { Box, Flex } from "@wwwares/ui-system/jsx";
import { Button } from "@wwwares/ui-react";
import { useResetTypingState } from "../hooks/use-reset-local";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// export const loader = async () => {
//   const words = getWords(1000);
//   return json({ words });
// };

export default function Index() {
  // const { words } = useLoaderData<typeof loader>();
  // useHydrateAtoms([[wordsAtom, getWords(1000).split(",")]]);
  // const [words, setwords] = useState(() => getWords(1000));

  const [words] = useAtom(wordsAtomAtom);
  const gState = useAtomValue(gStateAtom);

  useGameSync("localdev");

  const { resetState } = useResetTypingState();
  return (
    <Flex
      height="100%"
      width="100%"
      justifyContent="center"
      alignItems="center"
    >
      <Flex
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="100%"
        overflow="hidden"
        flexDirection="column"
        display="grid"
        gridTemplateColumns="repeat(10, 1fr)"
        gridTemplateRows="repeat(10, 1fr)"
      >
        <ClientOnly>
          {() => (
            <Fragment>
              <WordSync />
              <GameDebug />
              <Fragment>
                {gState === GameState.DONE ? (
                  <LocalGameEndScreen />
                ) : (
                  <Fragment>
                    <Box
                      gridColumn={"3/ span 6"}
                      gridRowStart="4"
                      alignSelf="flex-end"
                    >
                      <Button
                        intent="primary"
                        onPress={() => {
                          resetState();
                          // inputRef.current?.focus();
                        }}
                      >
                        reset
                      </Button>
                    </Box>
                    <Box gridColumn="3 / span 6" gridRowStart="5">
                      <WordComposition words={words} />
                    </Box>
                    <Box gridRowStart={"6"} gridColumn={"3 / span 6"}>
                      <RoomPlayerList />
                    </Box>
                  </Fragment>
                )}
              </Fragment>
            </Fragment>
          )}
        </ClientOnly>
      </Flex>
    </Flex>
  );
}

function WordSync() {
  useSyncInput();
  return null;
}
