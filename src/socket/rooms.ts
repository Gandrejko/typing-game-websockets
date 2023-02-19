import { Server, Socket } from "socket.io";

const roomsMap = new Map();
const numberOfUsersDefault = 0;

const listRooms = (socket) => {
  socket.emit("LIST_ROOMS_RESPONSE", [...roomsMap.entries()]);
};

const deleteRoom = (roomName, server) => {
  roomsMap.delete(roomName);
  server.emit("ROOM_DELETED", { roomName });
};

const leaveRoom = (roomName, server) => {
  if (!roomsMap.has(roomName)) {
    return;
  }

  const currentCount = roomsMap.get(roomName);

  if (currentCount <= 0) {
    deleteRoom(roomName, server);
  }

  const updatedCount = roomsMap.set(roomName, currentCount - 1).get(roomName);

  if (updatedCount <= 0) {
    deleteRoom(roomName, server);
  } else {
    server.emit("ROOM_UPDATED", { roomName, numberOfUsers: updatedCount });
  }
};

const joinRoom = (roomName, server) => {
  if (!roomsMap.has(roomName)) {
    return;
  }

  let currentCount = roomsMap.get(roomName);

  if (currentCount <= 0) {
    currentCount = 0;
  }

  const updatedCount = roomsMap.set(roomName, currentCount + 1).get(roomName);

  server.emit("ROOM_UPDATED", { roomName, numberOfUsers: updatedCount });
};

export const setupRoomsControls = (socket: Socket, server: Server) => {
  listRooms(socket);

  socket.on("ADD_ROOM", (roomName: string) => {
    if (roomsMap.has(roomName)) {
      socket.emit("ADD_ROOM_FAIL", {
        message: `Room with name "${roomName}" already exist`,
      });
      return;
    }

    const numberOfUsers = numberOfUsersDefault;

    roomsMap.set(roomName, numberOfUsers);

    server.emit("ROOM_UPDATED", { roomName, numberOfUsers });
    socket.emit("ADD_ROOM_SUCCESS", {
      roomName,
    });
  });

  socket.on("JOIN_ROOM", ({ roomName }: { roomName: string }) => {
    socket.join(roomName);

    joinRoom(roomName, server);

    socket.emit("JOIN_ROOM_SUCCESS", roomName);
  });

  socket.on("LEAVE_ROOM", (roomName: string) => {
    socket.leave(roomName);

    leaveRoom(roomName, server);

    socket.emit("LEAVE_ROOM_SUCCESS", roomName);
  });
};
