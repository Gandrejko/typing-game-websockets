import { getRoomUsers, setRoomUsers } from '../user';

export const removeUserFromRoom = (roomName, server, username) => {
	const roomUsers = getRoomUsers(roomName);
	if(!roomUsers) {
		return;
	}

	const index = roomUsers.findIndex(n => n.username === username);
	if (index !== -1) {
		roomUsers.splice(index, 1);
	}
	setRoomUsers(roomName, roomUsers);

	server.emit("REMOVE_USER", username)
}