import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// const socket = io("http://localhost:3000", {
//   // path: "/socket",
//   port: 3001,
//   withCredentials: true,
// });
// socket.on("connect", () => console.log("connected"));

// socket.on("ack", (data) => console.log(data));

fetch("http://localhost:3000/users").then((r) => r.json().then(console.log));

// console.log(socket);

function Sockeet(url: string, options: any) {
  let socket: Socket | null = null;
  function init() {
    if (!socket) {
      socket = io(url, options);
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
const sockeet = Sockeet("http://localhost:3000", {
  port: 3001,
  withCredentials: true,
});

function useSocket() {
  const [socket] = useState(() => sockeet.get());

  return {
    socket,
    isConnected: socket?.connected,
  };
}

export { sockeet, useSocket };
