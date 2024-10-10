import { Cron } from "croner";
import { createDailyTest } from "./utils";
import { leaderboard } from "./utils/leaderboard";

const refreshDailyJob = Cron("0 0 * * *", async () => {
	console.log("creating new daily test");
	await createDailyTest();
	leaderboard.reset();
});

export { refreshDailyJob, leaderboard as DailyLeaderboard };
