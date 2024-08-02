import type { MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useHydrateAtoms } from "jotai/utils";
import { getWords } from "wordkit";
import { wordsAtom, wordsAtomAtom } from "../state";
import { WordComposition, WordList } from "../components/word-list";
import { ClientOnly } from "remix-utils/client-only";
import { Fragment, useRef, useState } from "react";
import { useAtom } from "jotai";
import { useSyncInput } from "../hooks/use-sync-input";

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
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex justify-center items-center w-[80vw] h-full overflow-hidden">
        <ClientOnly>
          {() => (
            <Fragment>
              <WordSync />
              <WordComposition words={words} />
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
