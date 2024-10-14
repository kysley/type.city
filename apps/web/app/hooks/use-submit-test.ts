import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ResultSubmission } from "types";
import { req } from "../utils/ky";

function useSubmitTest({ mode }: { mode?: "daily" }) {
	const qc = useQueryClient();

	return useMutation({
		mutationKey: ["submit"],
		onSuccess: () => {
			qc.fetchQuery({ queryKey: ["me"] });
		},
		mutationFn: async ({ result }: { result: ResultSubmission }) => {
			const res = await req
				.post("submit", {
					json: { result, mode },
				})
				.json();

			return res;
		},
	});
}

export { useSubmitTest };
