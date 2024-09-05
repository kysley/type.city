import { Fragment } from "react";
import { useNavigate } from "@remix-run/react";
import { Button } from "@wwwares/ui-react";
import { DISCORD_URL } from "../utils/discord.auth";
import { useQuery } from "@tanstack/react-query";
import { Positions } from "./layout-positions";
import { Box, Flex, Grid } from "@wwwares/ui-system/jsx";

function Header() {
  const nav = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_SERVICE_URL}/me`, {
        method: "GET",
        credentials: "include",
      });

      const json = await res.json();

      if (res.status !== 200) {
        throw new Error(json);
      }

      return json;
    },
  });

  console.log({ data, isError });

  return (
    <Positions.Top>
      <Grid
        gridTemplateColumns="1fr 1fr 1fr"
        gridAutoFlow="column"
        alignItems="center"
        px="3"
        height="100%"
      >
        <Flex gridColumn="3" justifyContent="flex-end">
          {!isError ? (
            <span>{data?.name}</span>
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
        <img
          src="/typecity.svg"
          style={{ gridColumn: "2", justifySelf: "center", fill: "#fff" }}
        />
      </Grid>
    </Positions.Top>
  );
}

export { Header };
