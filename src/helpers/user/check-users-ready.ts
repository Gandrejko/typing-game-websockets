import { getRoomUsers } from './index';

export const checkUsersReady = (roomName: string) => {
	const roomUser = getRoomUsers(roomName);
	if(roomUser === undefined || roomUser.length <= 0) {
		return false;
	}
	return roomUser.every(user => user.ready);
}