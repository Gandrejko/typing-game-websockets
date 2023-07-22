import { createUser } from '../user/create-user';
import { getRoomUsers, setRoomUsers } from '../user';

export const addUserToRoom = (roomName, server, socket, username) => {
	const newUser = createUser({username});
	const roomUsers = getRoomUsers(roomName);
	if(!roomUsers) {
		return;
	}
	setRoomUsers(roomName, [...roomUsers, newUser]);
}