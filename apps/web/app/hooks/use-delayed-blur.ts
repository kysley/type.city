import { useEffect, useRef } from "react";

function useDelayedBlur(state: boolean, delay: number, action: () => void) {
	const timeoutRef = useRef<unknown>(null);

	useEffect(() => {
		if (!state) {
			timeoutRef.current = setTimeout(() => {
				if (!state) {
					action();
				}
			}, delay);
		}

		return () => {
			clearTimeout(timeoutRef.current as NodeJS.Timeout);
		};
	}, [state, delay, action]);
}

export { useDelayedBlur };
