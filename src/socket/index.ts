import { Server } from "socket.io";
import { RoomsMap } from '../types';
import { setupRoomsControls } from "./rooms";

const roomsMap: RoomsMap = new Map();
export const getRoomsMap = (): RoomsMap => roomsMap;

export default (io: Server) => {
  io.on("connection", (socket) => {
    const username = socket.handshake.query.username;
    setupRoomsControls(socket, io, username);
  });
};
