import { getRoomUsers } from './index';

export const checkUsersReady = (roomName: string) => {
	const roomUsers = getRoomUsers(roomName);
	if(roomUsers.length === 0) {
		return false;
	}
	return roomUsers.every(user => user.ready);
}