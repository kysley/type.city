import { Fragment } from "react";
import { useNavigate } from "@remix-run/react";
import { Button } from "@wwwares/ui-react";
import { DISCORD_URL } from "../utils/discord.auth";
import { useQuery } from "@tanstack/react-query";

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

  if (isLoading) {
    return null;
  }

  console.log({ data, isError });

  return (
    <Fragment>
      {!isError ? (
        <span>{data.name}</span>
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
    </Fragment>
  );
}

export { Header };
