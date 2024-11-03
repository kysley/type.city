import { Fragment } from "react";
import { Button } from "@wwwares/ui-react";
import { DISCORD_URL } from "../utils/discord.auth";
import { Positions } from "./layout-positions";
import { Flex, Grid } from "@wwwares/ui-system/jsx";
import { IconBadges } from "@tabler/icons-react";
import { useMe } from "../hooks/use-me";
import { Link } from "@remix-run/react";
import { levelSystem } from "types";

function Header() {
	const { data, isLoading, isError } = useMe();

	console.log({ data, isError });

	const levelInfo = levelSystem.getLevelInfo(data?.xp || 0);

	return (
		<Positions.Top>
			<Grid
				gridTemplateColumns="1fr 1fr 1fr"
				gridAutoFlow="column"
				alignItems="center"
				px="3"
				height="100%"
				color="text.default"
			>
				<Flex gridColumn="3" justifyContent="flex-end">
					{!isError ? (
						<Fragment>
							<span>{data?.name}</span>
							<span>
								<IconBadges style={{ display: "inline" }} />
								{levelInfo.level}
							</span>
						</Fragment>
					) : (
						<Button
							intent="primary"
							onPress={() => {
								window.location.href = DISCORD_URL;
							}}
						>
							Login with Discord
						</Button>
					)}
				</Flex>
				<Link
					to="/"
					style={{ gridColumn: "2", justifySelf: "center", fill: "#fff" }}
				>
					<img aria-label="type city" src="/typecity.svg" />
				</Link>
			</Grid>
		</Positions.Top>
	);
}

export { Header };
