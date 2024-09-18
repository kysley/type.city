import { io, Socket } from "socket.io-client";

const sockeet = io(import.meta.env.VITE_WS_URL, {
	path: "/type/s",
	port: 8013,
	withCredentials: true,
	autoConnect: true,
});

fetch(`${import.meta.env.VITE_SERVICE_URL}/users`, {
	credentials: "include",
}).then((r) => r.json().then(console.log));

function Sockeet(url: string, options: any) {
	let socket: Socket | null = null;
	function init() {
		if (!socket) {
			socket = io(url, options);
			// socket.connect();
		}
	}

	function get() {
		init();
		return socket;
	}

	return {
		get,
		init,
	};
}

function useSocket() {
	return {
		socket: sockeet,
	};
}

export { sockeet, useSocket };
