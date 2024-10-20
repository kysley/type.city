import { Flex } from "@wwwares/ui-system/jsx";
import { atom, useAtom, useAtomValue } from "jotai";
import { useState, useRef } from "react";
import { addStateToWord, cursorAtom, wordsAtomAtom } from "../../state";
import { cursorLookup } from "../../utils/cursors";
import { Cursor } from "../core/cursor";
import { AnnotatedLayout, Page } from "../page-layout";
import { Word } from "../word";
import { Button } from "@wwwares/ui-react";

function SettingsPage() {
	return (
		<Page title="Customization">
			<CursorSettingsSection />
		</Page>
	);
}

const wordAtom = atom(addStateToWord("ThisIsHowItWillLook", 1));
function CursorSettingsSection() {
	const [cursorId, setcursorId] = useAtom(cursorAtom);
	const [newId, setNewId] = useState(cursorId);
	const cRef = useRef(null);

	return (
		<AnnotatedLayout title="Cursor appearance">
			<Flex gap="5" flexDirection="column">
				<div
					style={{
						position: "relative",
						alignSelf: "center",
						display: "flex",
					}}
				>
					<Word wordAtom={wordAtom} className="word" />
					<Cursor container={cRef} cursorId={newId} />
				</div>

				<Flex gap="5">
					{Object.keys(cursorLookup).map((cursorKey) => (
						<Flex
							backgroundColor={newId === cursorKey ? "blue.500/50" : undefined}
							onClick={() => {
								console.log(cursorKey);
								setNewId(cursorKey);
							}}
						>
							<img
								key={cursorKey}
								src={cursorLookup[cursorKey]}
								alt="cursor"
								style={{
									height: "50px",
									scale: newId === cursorKey ? "0.85" : "1",
									transition: "scale, 0.05s ease-in",
								}}
							/>
						</Flex>
					))}
				</Flex>
				<Button
					onPress={() => setcursorId(newId)}
					intent="primary"
					style={{ alignSelf: "flex-start" }}
				>
					Save
				</Button>
			</Flex>
		</AnnotatedLayout>
	);
}

export { SettingsPage };
