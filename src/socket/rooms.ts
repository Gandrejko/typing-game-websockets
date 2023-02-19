import { Server, Socket } from "socket.io";

const roomsMap = new Map();
const numberOfUsersDefault = 0;

const findRoomByUsername = (username) => {
  let room;
  roomsMap.forEach((users, roomName) => {
    users.find(user => {
      if(user.username === username) room = roomName;
    });
  })

  return room
}

const getUsersCount = (roomName) => {
  return roomsMap.get(roomName).length
}

const addUserToRoom = (roomName, server, username) => {
  const newUser = {username, ready: false, isCurrentUser: true}
  roomsMap.set(roomName, [...roomsMap.get(roomName), newUser]);

  server.emit("ADD_USER", newUser);
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

const joinRoom = (roomName, server, username) => {
  if (!roomsMap.has(roomName)) {
    return;
  }

  addUserToRoom(roomName, server, username);

  const currentCount = getUsersCount(roomName);

  server.emit("ROOM_UPDATED", { roomName, numberOfUsers: currentCount });
};

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

    joinRoom(roomName, server, username);

    socket.emit("JOIN_ROOM_SUCCESS", roomName);
  });

  socket.on("LEAVE_ROOM", (roomName: string) => {
    socket.leave(roomName);

    leaveRoom(roomName, server, username);

    socket.emit("LEAVE_ROOM_SUCCESS", roomName);
  })

  socket.on("disconnect", () => {
    const roomName = findRoomByUsername(username);
    socket.leave(roomName);
    leaveRoom(roomName, server, username)
  })
};
