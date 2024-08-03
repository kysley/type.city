import type { MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useHydrateAtoms } from "jotai/utils";
import { getWords } from "wordkit";
import { GameState, gStateAtom, wordsAtom, wordsAtomAtom } from "../state";
import { WordComposition, WordList } from "../components/word-list";
import { ClientOnly } from "remix-utils/client-only";
import { Fragment, useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useSyncInput } from "../hooks/use-sync-input";
import { GameInfo } from "../components/game-info";
import { useSocket } from "../hooks/use-socket";
import { useGameSync } from "../hooks/use-game-sync";

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

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex justify-center items-center w-[80vw] h-full overflow-hidden">
        <ClientOnly>
          {() => (
            <Fragment>
              <WordSync />
              <div className="flex flex-col">
                {gState === GameState.DONE ? (
                  <div>game over</div>
                ) : (
                  <Fragment>
                    <GameInfo />
                    <WordComposition words={words} />
                  </Fragment>
                )}
              </div>
            </Fragment>
          )}
        </ClientOnly>
      </div>
    </div>
  );
}

function WordSync() {
  useSyncInput();
  return null;
}
