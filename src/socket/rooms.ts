import { Server, Socket } from "socket.io";
import {MAXIMUM_USERS_FOR_ONE_ROOM} from "./config";

const roomsMap = new Map();
const numberOfUsersDefault = 0;

const createNewUser = (username, ready = false, isCurrentUser = false) => {
  return {username, ready: ready, isCurrentUser: isCurrentUser}
}

const findIndexUserInRoom = (roomName, username) => {
  const users = roomsMap.get(roomName);
  const user = users.find(user => user.username === username);
  return users.indexOf(user)
}

const findUser = (username) => {
  let roomName, ready, isCurrentUser;
  roomsMap.forEach((users, room) => {
    users.find(user => {
      if(user.username === username) {
        roomName = room;
        ready = user.ready;
        isCurrentUser = user.isCurrentUser;
      }
    });
  })

  return {roomName, ready, isCurrentUser}
}

const getUsersCount = (roomName) => {
  return roomsMap.get(roomName).length
}

const addUserToRoom = (roomName, server, username) => {
  const newUser = createNewUser(username);
  roomsMap.set(roomName, [...roomsMap.get(roomName), newUser]);
}

const removeUserFromRoom = (roomName, server, username) => {
  const users = roomsMap.get(roomName);
  const index = users.findIndex(n => n.username === username);
  if (index !== -1) {
    users.splice(index, 1);
  }
  roomsMap.set(roomName, users);

  server.emit("REMOVE_USER", username)
}

const listRooms = (socket) => {
  socket.emit("LIST_ROOMS_RESPONSE", [...roomsMap.entries()]);
};

const listUsers = (roomName, socket) => {
  socket.emit("LIST_USERS_RESPONSE", roomsMap.get(roomName));
}

const deleteRoom = (roomName, server) => {
  roomsMap.delete(roomName);
  server.emit("ROOM_DELETED", { roomName });
};

const leaveRoom = (roomName, server, username) => {
  if (!roomsMap.has(roomName)) {
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
  if (!roomsMap.has(roomName)) {
    return;
  }

  listUsers(roomName, socket);
  addUserToRoom(roomName, server, username);

  const currentCount = getUsersCount(roomName);

  server.emit("ROOM_UPDATED", {roomName, numberOfUsers: currentCount});
};

export const checkUsersReady = (roomName) => {
  const users = roomsMap.get(roomName);
  return users.every(user => user.ready);
}

export const setupRoomsControls = (socket: Socket, server: Server, username) => {
  listRooms(socket);

  socket.on("ADD_ROOM", (roomName: string) => {
    if (roomsMap.has(roomName)) {
      socket.emit("FAIL", {
        message: `Room with name "${roomName}" already exist`,
      });
      return;
    }

    roomsMap.set(roomName, []);

    server.emit("ROOM_UPDATED", { roomName, numberOfUsers: getUsersCount(roomName) });
    socket.emit("ADD_ROOM_SUCCESS", roomName);
  });

  socket.on("JOIN_ROOM", (roomName: string) => {
    socket.join(roomName);

    joinRoom({roomName, server, socket, username});

    socket.emit("JOIN_ROOM_SUCCESS", roomName);

    const {ready, isCurrentUser} = findUser(username);
    server.emit("ADD_USER", {roomName, username, ready, isCurrentUser});
  });

  socket.on("LEAVE_ROOM", (roomName: string) => {
    socket.leave(roomName);

    leaveRoom(roomName, server, username);

    socket.emit("LEAVE_ROOM_SUCCESS", roomName);
  })

  socket.on("CHANGE_READY", (username) => {
    const user = findUser(username);
    const ready = !user.ready;
    const roomName = user.roomName;
    const userIndex = findIndexUserInRoom(roomName, username);
    const newUsers = roomsMap.get(roomName);
    newUsers[userIndex].ready = ready;
    roomsMap.set(roomName, newUsers);

    server.emit("CHANGE_READY_SUCCESS", {username, ready})
    socket.emit("CHANGE_READY_BTN", {ready})
  })


  socket.on("disconnect", () => {
    const {roomName} = findUser(username);
    socket.leave(roomName);
    leaveRoom(roomName, server, username)
  })
};
