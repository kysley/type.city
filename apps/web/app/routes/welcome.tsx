import { useNavigate, useSearchParams } from "@remix-run/react";
import { Flex } from "@wwwares/ui-system/jsx";
import { useEffect } from "react";
import { Positions } from "../components/layout-positions";
import { Spinner } from "@wwwares/ui-react";

export default function Welcome() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  useEffect(() => {
    async function register() {
      fetch(`${import.meta.env.VITE_SERVICE_URL}/register/discord`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "include",
      })
        .then((e) => {
          console.log(e);
          if (!e.ok) {
            throw e;
          }
          nav("/");
        })
        .catch(console.log);
      // console.log("fetching");
    }

    const code = params.get("code");
    console.log(code);
    if (code) {
      register();
    }
  }, [params]);

  return (
    <Positions.Center>
      <Flex
        height="100%"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
        color="text.default"
        gap="3"
      >
        <Spinner />
        <span>Hey! you should get redirected shortly</span>
      </Flex>
    </Positions.Center>
  );
}
