import { Server, Socket } from "socket.io";
import {MAXIMUM_USERS_FOR_ONE_ROOM, SECONDS_TIMER_BEFORE_START_GAME} from "./config";

const roomsMap = new Map();

const createNewUser = ({username, ready = false, isCurrentUser = false}) => {
  return {
    username,
    ready: ready,
    isCurrentUser: isCurrentUser,
    speed: null
  }
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

const addUserToRoom = (roomName, server, socket, username) => {
  const newUser = createNewUser({username});
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
  addUserToRoom(roomName, server, socket, username);

  const currentCount = getUsersCount(roomName);
  if (currentCount >= MAXIMUM_USERS_FOR_ONE_ROOM) {
    server.emit("FULL_ROOM", roomName);
  } else {
    server.emit("ROOM_UPDATED", { roomName, numberOfUsers: currentCount });
  }
};

export const checkUsersReady = (roomName) => {
  const users = roomsMap.get(roomName);
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
    const user = findUser(username);
    const ready = !user.ready;
    const roomName = user.roomName;
    const userIndex = findIndexUserInRoom(roomName, username);
    const newUsers = roomsMap.get(roomName);
    newUsers[userIndex].ready = ready;
    roomsMap.set(roomName, newUsers);

    if(checkUsersReady(roomName)) {
      server.emit("START_TIMER_BEFORE_GAME", {roomName, time: SECONDS_TIMER_BEFORE_START_GAME});
    }

    server.emit("CHANGE_READY_SUCCESS", {username, ready})
    socket.emit("CHANGE_READY_BTN", {ready})
  })

  socket.on("PROGRESS_UPDATED", (progress) => {
    server.emit("PROGRESS_UPDATED_SUCCESS", {username, progress})
  })

  socket.on("PLAYER_FINISHED", ({lettersCount, time}) => {
    const { roomName } = findUser(username);
    const room = roomsMap.get(roomName);
    const updatedRoom = room.map(user => {
      if(user.username == username) {
        user = {
          ...user,
          speed: +(lettersCount / time).toFixed(2)
        }
      }

      return user
    });

    roomsMap.set(roomName, updatedRoom);

    if(roomsMap.get(roomName).every(user => user.speed !== null)) {
      server.emit("GAME_FINISHED_SUCCESS", {usersSortedArray: roomsMap.get(roomName).sort((a, b) => b.speed - a.speed).map(user => user.username)})
    }
  })

  socket.on("GAME_FINISHED", () => {
    const { roomName } = findUser(username);
    server.emit("GAME_FINISHED_SUCCESS", {usersSortedArray: roomsMap.get(roomName).sort((a, b) => b.speed - a.speed).map(user => user.username)})
  })

  socket.on("disconnect", () => {
    const {roomName} = findUser(username);
    socket.leave(roomName);
    leaveRoom(roomName, server, username);
    if(checkUsersReady(roomName)) {
      server.emit("START_TIMER_BEFORE_GAME", {roomName, time: SECONDS_TIMER_BEFORE_START_GAME});
    }
  })
};
