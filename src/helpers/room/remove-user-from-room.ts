import { getRoomsMap } from '../states';

export const removeUserFromRoom = (roomName, server, username) => {
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