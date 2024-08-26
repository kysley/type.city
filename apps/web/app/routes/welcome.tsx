import { useSearchParams } from "@remix-run/react";
import { useEffect } from "react";

export default function Welcome() {
  const [params] = useSearchParams();
  console.log(import.meta);
  useEffect(() => {
    async function register() {
      fetch(`${import.meta.env.VITE_SERVICE_URL}/register/discord`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "include",
      }).then(console.log);
      // console.log("fetching");
    }

    const code = params.get("code");
    console.log(code);
    if (code) {
      register();
    }
  }, [params]);

  return <span>you should get redirected shortly</span>;
}
