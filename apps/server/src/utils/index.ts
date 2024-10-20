import { GameMode } from "types";
import { prisma } from "../utils/prisma";
import { Seed } from "@wwwares/seed-kit";

async function wait(duration: number) {
	return new Promise((resolve) => setTimeout(resolve, duration));
}

async function createDailyTest() {
	const mode = Math.random() < 0.5 ? 0 : 1;

	const conditions = {
		[GameMode.LIMIT]: [30, 60],
		[GameMode.RACE]: [30, 60, 10],
	};

	const conditionChoices = conditions[mode];

	const condition =
		conditionChoices[Math.floor(Math.random() * conditionChoices.length)];

	const seed = new Seed();
	return await prisma.daily.create({
		data: {
			condition,
			mode,
			seed: seed.state.seed,
		},
	});
}

export { wait, createDailyTest };
