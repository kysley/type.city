import type { MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useHydrateAtoms } from "jotai/utils";
import { getWords } from "wordkit";
import { wordsAtom } from "../state";
import { WordList } from "../components/word-list";
import { ClientOnly } from "remix-utils/client-only";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async () => {
  const words = getWords(1000);
  return json({ words });
};

export default function Index() {
  const { words } = useLoaderData<typeof loader>();
  // useHydrateAtoms([[wordsAtom, getWords(1000).split(",")]]);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex justify-center items-center w-[80vw] h-[110px] overflow-hidden">
        <ClientOnly>{() => <WordList />}</ClientOnly>
      </div>
    </div>
  );
}
