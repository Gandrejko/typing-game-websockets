import {showInputModal, showMessageModal} from "./views/modal.mjs";
import {appendRoomElement} from "./views/room.mjs";
import {addClass, removeClass} from "./helpers/domHelper.mjs";
import {appendUserElement} from "./views/user.mjs";

const username = sessionStorage.getItem('username');

if (!username) {
	window.location.replace('/login');
}

const socket = io('', { query: { username } });

const addRoomBtn = document.getElementById('add-room-btn');
addRoomBtn.addEventListener('click',() => onAddRoom());

const onAddRoom = () => {
	showInputModal({title: 'Enter room name', onSubmit: onSubmit});
}

const onSubmit = (inputModal) => {
	const inputElement = inputModal.querySelector('.modal-input');
	const roomName = inputElement.value;

	socket.emit("ADD_ROOM", roomName);
}

const onJoinRoom = (roomName) => {
	socket.emit("JOIN_ROOM", roomName)
}

const updateRooms = ({roomName, numberOfUsers}) => {
	if(!roomName) {
		return;
	}
	appendRoomElement({name: roomName, numberOfUsers: numberOfUsers, onJoin: () => onJoinRoom(roomName)})
}

const joinRoomDone = (roomName) => {
	const gamePage = document.getElementById('game-page');
	const roomsPage = document.getElementById('rooms-page');

	addClass(roomsPage, 'display-none');
	removeClass(gamePage, 'display-none');

	const roomTitle = document.getElementById('room-name');
	roomTitle.innerText = roomName;
}

const onleaveRoom = () => {
	const roomName = document.getElementById('room-name');
	socket.emit("LEAVE_ROOM", roomName.innerText)
}

const quitRoomBtn = document.getElementById('quit-room-btn');
quitRoomBtn.addEventListener('click', onleaveRoom);

const leaveRoomDone = () => {
	const gamePage = document.getElementById('game-page');
	const roomsPage = document.getElementById('rooms-page');

	addClass(gamePage, 'display-none');
	removeClass(roomsPage, 'display-none');
}

socket.on("ADD_USER", appendUserElement);

socket.on("SHOW_MODAL", showMessageModal);
socket.on("LEAVE_ROOM_DONE", leaveRoomDone);
socket.on("JOIN_ROOM_DONE", joinRoomDone);
socket.on("UPDATE_ROOMS", updateRooms);

