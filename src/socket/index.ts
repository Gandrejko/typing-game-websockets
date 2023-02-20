import { Server } from "socket.io";
import { setupRoomsControls } from "./rooms";
import {SECONDS_FOR_GAME} from "./config";

export default (io: Server) => {
  io.on("connection", (socket) => {
    const username = socket.handshake.query.username;
    setupRoomsControls(socket, io, username);

    socket.on("START_TIMER", () => {
      socket.emit("START_TIMER_SUCCESS", {time: SECONDS_FOR_GAME})
    })
  });
};
