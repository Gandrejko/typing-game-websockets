import { getRoomsMap } from '../states';
import { createUser } from '../user/create-user';

export const addUserToRoom = (roomName, server, socket, username) => {
	const newUser = createUser({username});
	const roomUsers = getRoomsMap().get(roomName);
	if(!roomUsers) {
		return;
	}
	getRoomsMap().set(roomName, [...roomUsers, newUser]);
}