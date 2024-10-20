import { Button, Card } from "@wwwares/ui-react";
import { useResetTypingState } from "../hooks/use-reset-local";
import { useAtomValue } from "jotai";
import {
	GameMode,
	gConditionAtom,
	gModeTypeAtom,
	gSnapshotAtom,
} from "../state";
import { StatShield } from "./stat-shield";
import { Flex, Grid } from "@wwwares/ui-system/jsx";
import { useMutationState } from "@tanstack/react-query";
import { useMe } from "../hooks/use-me";
import { type ResultResponse, xpSystem } from "types";
import { useMemo } from "react";
import { IconPlayerTrackNext, IconRefresh } from "@tabler/icons-react";

function SingleplayerGameEnd() {
	const { resetState } = useResetTypingState();
	const gSnapshot = useAtomValue(gSnapshotAtom);
	const gMode = useAtomValue(gModeTypeAtom);
	const gCondition = useAtomValue(gConditionAtom);

	const { data: user } = useMe();
	const submissions = useMutationState<ResultResponse>({
		filters: { mutationKey: ["submit"] },
		select: (mutation) => mutation.state.data as ResultResponse,
	});

	const submission = submissions[submissions.length - 1] ?? {
		valid: false,
		gainxp: 0,
		level: 0,
		levelup: false,
	};

	const resultText = useMemo(() => {
		let resultText = "";
		if (submission && user) {
			const gainXp = submission.gainxp;
			const curLvl = submission.level;
			if (submission.levelup) {
				resultText = `Level Up! ${curLvl}`;
			} else {
				const xpNext = xpSystem.xpForLevel(curLvl + 1);
				resultText = `Lvl ${user.level} -- +${gainXp}(${user.xp}/${xpNext}) --> ${
					curLvl + 1
				}`;
			}
		}
		return resultText;
	}, [submission, user]);
	return (
		<Card>
			<Grid
				gridTemplateAreas="
			'title title title'
			'medals other other'
			'medals other other'
			'actions actions actions'
			"
				gap="5"
				width="100%"
			>
				<Flex gridArea="medals" flexDirection={"column"} gap="5">
					<div>
						{resultText}
						{/* <progress
							style={{ alignSelf: "flex-start" }}
							value={user?.xp}
							max={xpSystem.xpForLevel(submission.level + 1)}
						/> */}
					</div>
					{submission.achievementUpdate?.map((ach) => {
						console.log(ach);
						if (ach.isNewTier) {
							return (
								<p key={ach.latestProgress.id}>
									ACHIEVEMENT UNLOCKED! {ach.achievement.name}
								</p>
							);
						}

						return (
							<p key={ach.latestProgress.id}>
								{ach.latestTier.name} ({ach.latestTier.description}){" "}
								{ach.latestProgress.currentProgress}/
								{ach.latestTier.requiredValue}
							</p>
						);
					})}
				</Flex>
				<Flex gridArea="other" flexDirection="column" gap="3">
					<Flex gap="3">
						<StatShield title="WPM" value={gSnapshot?.wpm} />
						<StatShield title="ACC" value={gSnapshot?.acc} />
						<StatShield title="APM" value={gSnapshot?.apm || 0} />
						<StatShield
							title="Mode"
							value={
								gMode === GameMode.RACE
									? `${gCondition} words`
									: `${gCondition}s`
							}
						/>
					</Flex>
					<SingleplayerAverageWPM thisWpm={gSnapshot?.wpm} averageWpm={0} />
				</Flex>
				<Flex gridArea="actions" gap="5">
					<Button variant="icon" onPress={() => resetState()}>
						Next
						<IconPlayerTrackNext />
					</Button>
					<Button
						variant="icon"
						onPress={() => resetState({ resetWords: true })}
					>
						Replay
						<IconRefresh />
					</Button>
				</Flex>
			</Grid>
		</Card>
	);
}

function SingleplayerAverageWPM({ thisWpm, averageWpm }) {
	const isThisTestBetter = thisWpm > averageWpm;

	// const difference = Math.round((thisWpm / averageWpm) * 100);
	const difference = Math.round((thisWpm / averageWpm) * 100) - 100;

	if (isThisTestBetter) {
		return (
			<Flex width="100%" flexDirection="column" height="100%" minHeight={150}>
				<Flex
					background="blue.700"
					height="100%"
					width="100%"
					justifyContent="space-between"
					flexDirection="column"
					color={"zinc.100"}
					padding="1"
					position="relative"
					borderRadius={2}
				>
					<Flex justifyContent="space-between">
						<span>{thisWpm}wpm</span>
						THIS TEST
					</Flex>
					<Flex
						background="zinc.100"
						width="100%"
						justifyContent="space-between"
						flexDirection="row"
						color="zinc.900"
						style={{ height: `${100 - difference}%` }}
						borderRadius={2}
					>
						<span>{averageWpm}wpm</span>
						YOUR AVERAGE
					</Flex>
				</Flex>
			</Flex>
		);
	}

	return (
		<Flex width="100%" flexDirection="column" height="100%" minHeight={150}>
			<Flex
				background="zinc.100"
				height="100%"
				width="100%"
				justifyContent="space-between"
				flexDirection="column"
				color={"zinc.900"}
				padding="1"
				position="relative"
				borderRadius={2}
			>
				<Flex justifyContent="space-between">
					<span>{averageWpm}wpm</span>
					YOUR AVERAGE
				</Flex>
				<Flex
					background="blue.700"
					width="100%"
					justifyContent="space-between"
					flexDirection="row"
					color="zinc.100"
					style={{ height: `${100 - Math.abs(difference)}%` }}
					borderRadius={2}
				>
					<span>{thisWpm}wpm</span>
					<span>THIS TEST</span>
				</Flex>
			</Flex>
		</Flex>
	);
}

export { SingleplayerGameEnd };
