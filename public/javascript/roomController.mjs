import {showInputModal, showMessageModal, showResultsModal} from './views/modal.mjs';
import {
  appendRoomElement,
  roomExists,
  updateNumberOfUsersInRoom,
  removeRoomElement,
} from "./views/room.mjs";
import { addClass, removeClass } from "./helpers/domHelper.mjs";
import {
  appendUserElement,
  changeReadyStatus,
  changeReadyStatusBtn,
  removeUserElement,
  userExists
} from "./views/user.mjs";

import socket from "./socket.standalone.mjs";
import usernameSS from "./username.standalone.mjs";

const userExist = ({ message }) => {
  	showMessageModal({ message, onClose: () => window.location.replace('/login') });
  	sessionStorage.removeItem('username');

    setTimeout(() => window.location.replace('/login'), 2000);
}

const addRoomBtn = document.getElementById("add-room-btn");
addRoomBtn.addEventListener("click", () => addRoom());

const addRoom = () => {
  showInputModal({
    title: "Enter room name",
    onSubmit: (roomName) => {
      socket.emit("ADD_ROOM", roomName);
    },
  });
};

socket.on("FAIL", (message) => showMessageModal(message));
socket.on("ADD_ROOM_SUCCESS", (roomName) => joinRoom(roomName));

const joinRoom = (roomName) => {
  socket.emit("JOIN_ROOM", roomName);
}

const updateRooms = (list) => {
  for (const [roomName, numberOfUsers] of list) {
    updateRoom({ roomName, numberOfUsers });
  }
};

const updateRoom = ({ roomName, numberOfUsers }) => {
  if (!roomName) {
    return;
  }

  if (roomExists(roomName)) {
    updateNumberOfUsersInRoom({ name: roomName, numberOfUsers });
  } else {
    appendRoomElement({
      name: roomName,
      numberOfUsers: numberOfUsers,
      onJoin: () => joinRoom(roomName),
    });
  }
};

const updateUsers = (list) => {
  for (const user of list) {
    if(!userExists(user.username)) {
      appendUserElement(user);
    }
  }
};

const joinRoomDone = (roomName) => {
  const gamePage = document.getElementById("game-page");
  const roomsPage = document.getElementById("rooms-page");

  addClass(roomsPage, "display-none");
  removeClass(gamePage, "display-none");

  const roomTitle = document.getElementById("room-name");
  roomTitle.innerText = roomName;
};

const leaveRoom = () => {
  const roomName = document.getElementById("room-name");
  socket.emit("LEAVE_ROOM", roomName.innerText);
};

const quitRoomBtn = document.getElementById("quit-room-btn");
quitRoomBtn.addEventListener("click", leaveRoom);

const leaveRoomDone = () => {
  const gamePage = document.getElementById("game-page");
  const roomsPage = document.getElementById("rooms-page");

  addClass(gamePage, "display-none");
  removeClass(roomsPage, "display-none");
};

const onReadyChange = () => {
  socket.emit("CHANGE_READY", usernameSS);
}

const readyBtn = document.getElementById('ready-btn');
readyBtn.addEventListener('click', onReadyChange);

const addUser = ({roomName, username, ready}) => {
  const roomTitle = document.getElementById('room-name');
  const isCurrentUser = usernameSS === username;
  if(roomName === roomTitle.innerText) {
    appendUserElement({username, ready, isCurrentUser})
  }
}

const addButtons = () => {
  const quitRoomBtn = document.getElementById("quit-room-btn");
  const readyBtn = document.getElementById('ready-btn');

  removeClass(quitRoomBtn, 'display-none');
  removeClass(readyBtn, 'display-none');
}

const finishGame = ({ usersSortedArray, roomName }) => {
  const textContainer = document.getElementById('text-container');
  const timerElement = document.getElementById('game-timer');

  addClass(textContainer, 'display-none');
  addClass(timerElement, 'display-none');
  showResultsModal({ usersSortedArray, onClose: addButtons });

  usersSortedArray.forEach(username => {
    removeUserElement(username);
    addUser({roomName, username, ready: false});
    changeReadyStatus({username, ready: false});
    changeReadyStatusBtn({ready: false});
  })
}

socket.on("CHANGE_READY_BTN", changeReadyStatusBtn);
socket.on("CHANGE_READY_SUCCESS", changeReadyStatus);
socket.on("REMOVE_ROOM", removeRoomElement);
socket.on("ADD_USER", addUser);
socket.on("REMOVE_USER", removeUserElement);
socket.on("LEAVE_ROOM_SUCCESS", leaveRoomDone);
socket.on("JOIN_ROOM_SUCCESS", joinRoomDone);
socket.on("GAME_FINISHED", finishGame);
socket.on("LIST_ROOMS_RESPONSE", updateRooms);
socket.on("LIST_USERS_RESPONSE", updateUsers);
socket.on("USER_EXIST", userExist);