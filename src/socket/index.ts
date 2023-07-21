import { Server } from "socket.io";
import { setupRoomsControls } from "./rooms";

export default (io: Server) => {
  io.on("connection", (socket) => {
    const username = socket.handshake.query.username;
    setupRoomsControls(socket, io, username);
  });
};
