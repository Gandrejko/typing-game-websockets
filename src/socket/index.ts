import { Server } from "socket.io";
import { setupRoomsControls } from "./rooms";

export const usernames = new Set();

export default (io: Server) => {
  io.on("connection", (socket) => {
    const username = socket.handshake.query.username;
    if(usernames.has(username)) {
      socket.emit("USER_EXIST", {
        message: `User with username ${username} already exist`,
      });
      return;
    }

    usernames.add(username);
    setupRoomsControls(socket, io, username);
  })
};
