import type { MetaFunction } from "@remix-run/node";
import { GameState, gStateAtom, wordsAtomAtom } from "../state";
import { WordComposition } from "../components/word-list";
import { ClientOnly } from "remix-utils/client-only";
import { Fragment } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useSyncInput } from "../hooks/use-sync-input";
import { GameDebug } from "../components/game-info";
import { LocalGameEndScreen } from "../components/local-game-end-screen";
import { Box, Flex } from "@wwwares/ui-system/jsx";
import {
  LocalGameActions,
  LocalGameRestart,
} from "../components/local/game-actions";

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
  const [words] = useAtom(wordsAtomAtom);
  const gState = useAtomValue(gStateAtom);

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
        data-color-mode="dark"
      >
        <ClientOnly>
          {() => (
            <Fragment>
              <WordSync />
              <GameDebug />
              <Fragment>
                {gState === GameState.DONE ? (
                  <Box gridColumn="3 / span 6" gridRowStart="5">
                    <LocalGameEndScreen />
                  </Box>
                ) : (
                  <Fragment>
                    <WordComposition words={words} />
                    <LocalGameRestart />
                    <LocalGameActions />
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

export function WordSync() {
  useSyncInput();
  return null;
}
