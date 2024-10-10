import { IconCursorText, IconPalette, IconPointer } from "@tabler/icons-react";
import { Button, Modal, TextField } from "@wwwares/ui-react";
import { useAtom, useAtomValue } from "jotai";
import { cursorAtom, wordsAtomAtom } from "../state";
import { useRef, useState } from "react";
import { cursorLookup } from "../utils/cursors";
import { Flex } from "@wwwares/ui-system/jsx";
import { Word } from "./word";
import { Cursor } from "./core/cursor";

function ChangeCursorButton() {
	const [cursorId, setcursorId] = useAtom(cursorAtom);
	const [newId, setNewId] = useState(cursorId);
	const [firstWord] = useAtomValue(wordsAtomAtom);
	const cRef = useRef(null);
	return (
		<Modal
			title="Change cursor"
			activator={
				<Button variant="icon">
					{/* Change cursor */}
					<IconCursorText style={{ display: "inline" }} />
				</Button>
			}
			primaryAction={
				<Button
					intent="primary"
					onPress={() => {
						setcursorId(newId);
					}}
				>
					Confirm
				</Button>
			}
		>
			{({ close }) => (
				<>
					<Flex flexDirection="column">
						<div
							style={{
								position: "relative",
								alignSelf: "center",
								display: "flex",
							}}
						>
							{/* <WordList words={[firstWord]} ref={cRef} height={30} /> */}
							<Word wordAtom={firstWord} className="word" />
							<Cursor container={cRef} cursorId={newId} />
						</div>

						<Flex gap="5">
							{Object.keys(cursorLookup).map((cursorKey) => (
								<Flex
									backgroundColor={
										newId === cursorKey ? "blue.500/50" : undefined
									}
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
					</Flex>
				</>
			)}
		</Modal>
	);
}

export { ChangeCursorButton };
