import { Server, Socket } from "socket.io";
import { createRandomNumber } from '../helpers/create-random-number';
import { getSortedUsers } from '../helpers/get-sorted-users';
import { resetPlayers } from '../helpers/reset-players';
import { findRoomName } from '../helpers/room/find-room-name';
import { setPlayerSpeed } from '../helpers/set-player-speed';
import { getRoomsMap } from '../helpers/states';
import { findUser, findUserIndex } from '../helpers/user/find-user';
import { MAXIMUM_USERS_FOR_ONE_ROOM, SECONDS_FOR_GAME, SECONDS_TIMER_BEFORE_START_GAME } from "./config";

const createNewUser = ({username, ready = false, isCurrentUser = false}) => {
  return {
    username,
    ready: ready,
    isCurrentUser: isCurrentUser,
    speed: null
  }
}

const getUsersCount = (roomName) => {
  return getRoomsMap().get(roomName)?.length || 0
}

const addUserToRoom = (roomName, server, socket, username) => {
  const newUser = createNewUser({username});
  const roomUsers = getRoomsMap().get(roomName);
  if(!roomUsers) {
    return;
  }
  getRoomsMap().set(roomName, [...roomUsers, newUser]);
}

const removeUserFromRoom = (roomName, server, username) => {
  const roomUsers = getRoomsMap().get(roomName);  if(!roomUsers) {
    return;
  }

  const index = roomUsers.findIndex(n => n.username === username);
  if (index !== -1) {
    roomUsers.splice(index, 1);
  }
  getRoomsMap().set(roomName, roomUsers);

  server.emit("REMOVE_USER", username)
}

const listRooms = (socket) => {
  socket.emit("LIST_ROOMS_RESPONSE", [...getRoomsMap().entries()]);
};

const listUsers = (roomName, socket) => {
  socket.emit("LIST_USERS_RESPONSE", getRoomsMap().get(roomName));
}

const deleteRoom = (roomName, server) => {
  getRoomsMap().delete(roomName);
  server.emit("ROOM_DELETED", { roomName });
};

const leaveRoom = (roomName, server, username) => {
  if (!getRoomsMap().has(roomName)) {
    return;
  }

  removeUserFromRoom(roomName, server, username);

  const currentCount = getUsersCount(roomName);

  if (currentCount <= 0) {
    deleteRoom(roomName, server);
  } else {
    server.emit("ROOM_UPDATED", { roomName, numberOfUsers: currentCount });
  }
};

const joinRoom = ({roomName, server, socket, username}) => {
  if (!getRoomsMap().has(roomName)) {
    return;
  }

  listUsers(roomName, socket);
  addUserToRoom(roomName, server, socket, username);

  const currentCount = getUsersCount(roomName);
  if (currentCount >= MAXIMUM_USERS_FOR_ONE_ROOM) {
    server.emit("FULL_ROOM", roomName);
  } else {
    server.emit("ROOM_UPDATED", { roomName, numberOfUsers: currentCount });
  }
};

export const checkUsersReady = (roomName) => {
  const users = getRoomsMap().get(roomName);
  if(users === undefined || users.length <= 0) {
    return false;
  }
  return users.every(user => user.ready);
}

export const setupRoomsControls = (socket: Socket, server: Server, username) => {
  listRooms(socket);

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
