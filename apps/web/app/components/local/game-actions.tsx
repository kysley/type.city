import { Box, Flex } from "@wwwares/ui-system/jsx";
import { ChangeCursorButton } from "../change-cursor-button";
import { useResetTypingState } from "../../hooks/use-reset-local";
import {
	IconBellSchool,
	IconBrandDaysCounter,
	IconClock24,
	IconNumber,
	IconRefresh,
	IconRotate,
	IconRotate3d,
	IconSunMoon,
} from "@tabler/icons-react";
import { useAtom } from "jotai";
import { GameMode, gModeConditionAtom, gModeTypeAtom } from "../../state";
import {
	Button,
	SegmentedControlGroup,
	SegmentedControlOption,
} from "@wwwares/ui-react";
import { useSocket } from "../../hooks/use-socket";
import { ClientEvents } from "types";
import { CreateMpGameModalButton } from "../multiplayer/create-game-modal";
import { Link } from "@remix-run/react";

function LocalGameActions() {
	const { socket } = useSocket();
	const [gmCondition, setGMCondition] = useAtom(gModeConditionAtom);
	const [gModeType, setGModeType] = useAtom(gModeTypeAtom);

	return (
		<Flex alignItems="flex-end" justifyContent="space-between" height="100%">
			<Flex gap="4">
				<Button
					variant="icon"
					onPress={() => {
						setGModeType(GameMode.LIMIT);
					}}
				>
					<IconBellSchool title="Duration" />
				</Button>

				<Button
					variant="icon"
					onPress={() => {
						setGModeType(GameMode.RACE);
					}}
				>
					<IconNumber title="Words" />
				</Button>

				<Box width="1px" height="100%" backgroundColor="red" />

				{gModeType === GameMode.LIMIT && (
					<SegmentedControlGroup
						value={gmCondition[GameMode.LIMIT].toString()}
						onChange={(count) => {
							setGMCondition((p) => ({
								...p,
								[GameMode.LIMIT]: Number(count),
							}));
						}}
					>
						<SegmentedControlOption title="15s" value={"15"} />
						<SegmentedControlOption title="30s" value={"30"} />
						<SegmentedControlOption title="45s" value={"45"} />
						<SegmentedControlOption title="60s" value={"60"} />
					</SegmentedControlGroup>
				)}
				{gModeType === GameMode.RACE && (
					<SegmentedControlGroup
						value={gmCondition[GameMode.RACE].toString()}
						onChange={(count) => {
							setGMCondition((p) => ({ ...p, [GameMode.RACE]: Number(count) }));
						}}
					>
						<SegmentedControlOption title="10 word" value={"10"} />
						<SegmentedControlOption title="25 word" value={"25"} />
						<SegmentedControlOption title="50 word" value={"50"} />
					</SegmentedControlGroup>
				)}
			</Flex>
			<Flex gap="2">
				<CreateMpGameModalButton />
				<Link to="/daily">
					<IconClock24 style={{ display: "inline" }} /> Daily
				</Link>
				<ChangeCursorButton />
			</Flex>
		</Flex>
	);
}

function LocalGameRestart() {
	const { resetState } = useResetTypingState();

	return (
		<Flex alignSelf="center">
			<Button type="button" variant="icon" onPress={() => resetState()}>
				<IconRefresh color="white" />
			</Button>
		</Flex>
	);
}

export { LocalGameActions, LocalGameRestart };
