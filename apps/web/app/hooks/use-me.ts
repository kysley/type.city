import { useQuery } from "@tanstack/react-query";

function useMe() {
	return useQuery({
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
}

export { useMe };
