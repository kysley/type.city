import { useQuery } from "@tanstack/react-query";
import { req } from "../../utils/ky";
import { Button, Modal } from "@wwwares/ui-react";
import { IconChartBar } from "@tabler/icons-react";
import { Flex } from "@wwwares/ui-system/jsx";
import { Fragment } from "react/jsx-runtime";

function DailyLeaderboardModalButton() {
	const { data, isLoading } = useQuery({
		queryKey: ["daily", "leaderboard"],
		queryFn: async () => req.get("daily/leaderboard").json(),
	});

	if (isLoading) {
		return null;
	}

	return (
		<Modal
			title="Daily leaderboard"
			activator={
				<Button>
					<IconChartBar style={{ display: "inline" }} />
					Leaderboard
				</Button>
			}
		>
			{({ close }) => (
				<Fragment>
					{data?.map(([user, wpm], idx) => (
						<Flex>
							<pre>{`${idx + 1}) ${wpm} - ${user}`}</pre>
						</Flex>
					))}
				</Fragment>
			)}
		</Modal>
	);
}

export { DailyLeaderboardModalButton };
