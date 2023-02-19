import { Server } from "socket.io";
import { setupRoomsControls } from "./rooms";

export default (io: Server) => {
  io.on("connection", (socket) => {
    setupRoomsControls(socket, io);
  });
};
