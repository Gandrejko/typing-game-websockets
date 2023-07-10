import { Server } from "socket.io";
import { setupRoomsControls } from "./rooms";
import {SECONDS_FOR_GAME} from "./config";
import {texts} from "../data";

const createRandomNumber = () => {
  return Math.floor(Math.random() * texts.length);
}

export default (io: Server) => {
  io.on("connection", (socket) => {
    const username = socket.handshake.query.username;
    setupRoomsControls(socket, io, username);

    socket.on("START_GAME", (roomName) => {
      socket.emit("START_GAME_SUCCESS", {randomNumber: createRandomNumber(), gameDuration: SECONDS_FOR_GAME})
    })
  });
};
