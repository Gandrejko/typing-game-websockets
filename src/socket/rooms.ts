import { Server, Socket } from "socket.io";
import { createRandomNumber } from '../helpers/create-random-number';
import { getSortedUsers } from '../helpers/get-sorted-users';
import { resetPlayers } from '../helpers/reset-players';
import { findRoomName } from '../helpers/room/find-room-name';
import { joinRoom } from '../helpers/room/join-room';
import { leaveRoom } from '../helpers/room/leave-room';
import { setPlayerSpeed } from '../helpers/set-player-speed';
import { getRoomsMap } from '../helpers/states';
import { checkUsersReady } from '../helpers/user/check-users-ready';
import { findUser, findUserIndex } from '../helpers/user/find-user';
import { getUsersCount } from '../helpers/user/get-users-count';
import { SECONDS_FOR_GAME, SECONDS_TIMER_BEFORE_START_GAME } from "./config";

export const setupRoomsControls = (socket: Socket, server: Server, username) => {
  socket.emit("LIST_ROOMS_RESPONSE", [...getRoomsMap().entries()]);

  socket.on("ADD_ROOM", (roomName: string) => {
    if(roomName.trim().length === 0) {
      socket.emit("FAIL", {
        message: `Room name couldn't be empty`,
      });
      return;
    }
    if (getRoomsMap().has(roomName)) {
      socket.emit("FAIL", {
        message: `Room with name "${roomName}" already exist`,
      });
      return;
    }

    getRoomsMap().set(roomName, []);

    server.emit("ROOM_UPDATED", { roomName, numberOfUsers: getUsersCount(roomName) });
    socket.emit("ADD_ROOM_SUCCESS", roomName);
  });

  socket.on("JOIN_ROOM", (roomName: string) => {
    joinRoom({roomName, server, socket, username});
    socket.join(roomName);

    socket.emit("JOIN_ROOM_SUCCESS", roomName);

    server.emit("ADD_USER", {roomName, username, ready: false});
  });

  socket.on("LEAVE_ROOM", (roomName: string) => {
    socket.leave(roomName);

    leaveRoom(roomName, server, username);

    socket.emit("LEAVE_ROOM_SUCCESS", roomName);
  })

  socket.on("CHANGE_READY", (username) => {
    const roomName = findRoomName(username);
    const user = findUser(roomName, username);
    const newUsers = getRoomsMap().get(roomName);
    if(!user || !newUsers) {
      return;
    }

    const newReady = !user.ready;
    const userIndex = findUserIndex(roomName, username);
    newUsers[userIndex].ready = newReady;
    getRoomsMap().set(roomName, newUsers);

    if(checkUsersReady(roomName)) {
      server.emit("START_TIMER_BEFORE_GAME", {roomName, time: SECONDS_TIMER_BEFORE_START_GAME});
    }

    server.emit("CHANGE_READY_SUCCESS", {username, ready: newReady})
    socket.emit("CHANGE_READY_BTN", {ready: newReady})
  })

  socket.on("PROGRESS_UPDATED", (progress) => {
    server.emit("PROGRESS_UPDATED_SUCCESS", {username, progress})
  });

  socket.on("START_GAME", (roomName) => {
    socket.emit("START_GAME_SUCCESS", {randomNumber: createRandomNumber(), gameDuration: SECONDS_FOR_GAME})
  })

  socket.on("PLAYER_FINISHED", ({lettersCount, time}) => {
    const roomName = findRoomName(username);
    const room = getRoomsMap().get(roomName);
    const updatedRoom = setPlayerSpeed({room, username, lettersCount, time});
    getRoomsMap().set(roomName, updatedRoom);

    socket.emit("PLAYER_FINISHED_SUCCESS");
    if(getRoomsMap().get(roomName)?.every(user => user.speed !== null)) {
      const room = getRoomsMap().get(roomName);
      server.in(roomName).emit("GAME_FINISHED_SUCCESS", {usersSortedArray: getSortedUsers(room), roomName});
      const updatedRoom = resetPlayers(room);
      getRoomsMap().set(roomName, updatedRoom);
    }
  })

  socket.on("GAME_FINISHED", ({ lettersCount, time }) => {
    const roomName = findRoomName(username);
    const room = getRoomsMap().get(roomName);
    const updatedRoom = setPlayerSpeed({room, username, lettersCount, time});
    getRoomsMap().set(roomName, updatedRoom);

    server.in(roomName).emit("GAME_FINISHED_SUCCESS", {usersSortedArray: getSortedUsers(room), roomName});
    const resetedRoom = resetPlayers(room);
    getRoomsMap().set(roomName, resetedRoom);
  })


  socket.on("disconnect", () => {
    const roomName = findRoomName(username);
    socket.leave(roomName);
    leaveRoom(roomName, server, username);
  })
};
