import { Server, Socket } from "socket.io";
import { defaultRoom } from '../constants';
import { calcProgress } from '../helpers/calc-progress';
import { getRoomText, getRoomTime, setRoom } from '../helpers/room';
import { findRoomName } from '../helpers/room/find-room-name';
import { finishGame } from '../helpers/room/finish-game';
import { getRoomsList } from '../helpers/room/get-rooms-list';
import { joinRoom } from '../helpers/room/join-room';
import { leaveRoom } from '../helpers/room/leave-room';
import { setPlayerSpeed } from '../helpers/set-player-speed';
import { startGame } from '../helpers/start-game';
import { getRoomUsers, getUser, getUserIndex, setRoomUsers } from '../helpers/user';
import { checkUsersReady } from '../helpers/user/check-users-ready';
import { getUsersCount } from '../helpers/user/get-users-count';
import { RoomsMap } from '../types';

export const roomsMap: RoomsMap = new Map();
export const setupRoomsControls = (socket: Socket, server: Server, username) => {
  socket.emit("LIST_ROOMS_RESPONSE", getRoomsList());

  socket.on("ADD_ROOM", (roomName: string) => {
    if(roomName.trim().length === 0) {
      socket.emit("FAIL", {
        message: `Room name couldn't be empty`,
      });
      return;
    }
    if (roomsMap.has(roomName)) {
      socket.emit("FAIL", {
        message: `Room with name "${roomName}" already exist`,
      });
      return;
    }

    setRoom(roomName, defaultRoom);

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
    leaveRoom({roomName, server, username, socket});

    socket.emit("LEAVE_ROOM_SUCCESS", roomName);
  });

  socket.on("CHANGE_READY", (username) => {
    const roomName = findRoomName(username);
    const user = getUser(roomName, username);
    const newUsers = getRoomUsers(roomName);
    if(!user || !newUsers) {
      return;
    }

    const newReady = !user.ready;
    const userIndex = getUserIndex(roomName, username);
    newUsers[userIndex].ready = newReady;
    setRoomUsers(roomName, newUsers)

    if(checkUsersReady(roomName)) {
      startGame(roomName, socket, server);
    }

    server.emit("CHANGE_READY_SUCCESS", {username, ready: newReady})
    socket.emit("CHANGE_READY_BTN", {ready: newReady})
  });

  socket.on("PROGRESS_UPDATED", ({ lettersTyped }) => {
    const roomName = findRoomName(username);
    const roomUsers = getRoomUsers(roomName);
    const roomTime = getRoomTime(roomName);
    const roomTextLength = getRoomText(roomName)?.length;
    if(roomTime === undefined || roomTextLength === undefined) {
       return;
    }
    setPlayerSpeed(roomName, roomUsers, username, lettersTyped, roomTime);

    server.emit("PROGRESS_UPDATED_SUCCESS", {username, progress: calcProgress(roomTextLength, lettersTyped)});
  });

  socket.on("PLAYER_FINISHED", () => {
    const roomName = findRoomName(username);
    const roomUsers = getRoomUsers(roomName);
    const roomTime = getRoomTime(roomName);
    const roomTextLength = getRoomText(roomName)?.length;
    if(!roomUsers || roomTime === undefined || roomTextLength === undefined) {
      return;
    }
    setPlayerSpeed(roomName, roomUsers, username, roomTextLength , roomTime);

    socket.emit("PLAYER_FINISHED_SUCCESS");
    const allPlayersFinished = roomsMap.get(roomName)?.users.every(user => user.speed !== null);
    if(allPlayersFinished) {
      finishGame(roomName, server);
    }
  });

  socket.on("disconnect", () => {
    const roomName = findRoomName(username);
    leaveRoom({roomName, server, username, socket});
  });
};
