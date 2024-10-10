import ky from "ky";

const req = ky.create({
	prefixUrl: import.meta.env.VITE_SERVICE_URL,
	credentials: "include",
});

export { req };
