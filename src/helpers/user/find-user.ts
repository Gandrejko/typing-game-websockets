import { User } from '../../types';
import { getRoomsMap } from '../states';

export const findUser = (roomName, username) => {
	const roomUsers = getRoomsMap().get(roomName);
	if(!roomUsers) {
		return;
	}

	return roomUsers.find(user => user.username === username);
}

export const findUserIndex = (roomName, username) => {
	const roomUsers = getRoomsMap().get(roomName);
	if(!roomUsers) {
		return -1;
	}
	const user = roomUsers.find(user => user.username === username);
	return roomUsers.indexOf(<User>user)
}