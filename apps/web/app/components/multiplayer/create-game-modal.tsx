import {
	Button,
	Modal,
	Radio,
	RadioGroup,
	SegmentedControlGroup,
	SegmentedControlOption,
	TextField,
} from "@wwwares/ui-react";
import { Flex } from "@wwwares/ui-system/jsx";
import { useState } from "react";
import { ClientEvents, GameMode, gameModeName } from "types";
import { useSocket } from "../../hooks/use-socket";
import { IconGlobe, IconWorld } from "@tabler/icons-react";

function CreateMpGameModalButton() {
	const [gameMode, setGameMode] = useState(GameMode.LIMIT);
	const [condition, setCondition] = useState(30);
	const [numLegs, setNumLegs] = useState(2);

	const { socket } = useSocket();

	return (
		<Modal
			// defaultOpen
			title="Create a new game"
			activator={
				<Button>
					<IconWorld style={{ display: "inline" }} />
					Online
				</Button>
			}
			tertiaryAction="&nbsp;"
			secondaryAction=<Button>Cancel</Button>
			primaryAction={
				<Button
					intent="primary"
					onPress={() =>
						socket.emit(ClientEvents.ROOM_CREATE, {
							mode: gameMode,
							condition,
							...(gameMode === GameMode.RELAY && {
								meta: { legs: numLegs || 2 },
							}),
						})
					}
				>
					Play
				</Button>
			}
		>
			{({ close }) => (
				<Flex flexDirection="column" gap="5">
					<SegmentedControlGroup
						defaultValue={gameMode.toString()}
						onChange={(v) => {
							setGameMode(Number(v));
							setCondition(Number(v) === GameMode.LIMIT ? 30 : 25);
						}}
					>
						<SegmentedControlOption
							title={gameModeName[GameMode.LIMIT]}
							value={GameMode.LIMIT.toString()}
						/>
						<SegmentedControlOption
							title={gameModeName[GameMode.RACE]}
							value={GameMode.RACE.toString()}
						/>
						<SegmentedControlOption
							title={gameModeName[GameMode.RELAY]}
							value={GameMode.RELAY.toString()}
						/>
					</SegmentedControlGroup>
					{gameMode === GameMode.LIMIT && (
						<RadioGroup
							label="Duration"
							value={condition.toString()}
							onChange={(v) => setCondition(Number(v))}
						>
							<Radio label="15 seconds" value={"15"}>
								15 seconds
							</Radio>
							<Radio label="30 seconds" value={"30"}>
								30 seconds
							</Radio>
							<Radio label="60 seconds" value={"60"}>
								60 seconds
							</Radio>
						</RadioGroup>
					)}
					{(gameMode === GameMode.RACE || gameMode === GameMode.RELAY) && (
						<RadioGroup
							label="Number of words"
							value={condition.toString()}
							onChange={(v) => setCondition(Number(v))}
						>
							<Radio label="10 words" value={"10"}>
								10 words
							</Radio>
							<Radio label="25 words" value={"25"}>
								25 words
							</Radio>
							<Radio label="50 words" value={"50"}>
								50 words
							</Radio>
						</RadioGroup>
					)}
					{gameMode === GameMode.RELAY && (
						<TextField
							label="Number of legs"
							value={numLegs.toString()}
							onChange={(v) => setNumLegs(Number(v))}
							// validate={() => }
							// validationBehavior="native"
							type="number"
							// maxValue="5"
						/>
					)}
				</Flex>
			)}
		</Modal>
	);
}

export { CreateMpGameModalButton };
