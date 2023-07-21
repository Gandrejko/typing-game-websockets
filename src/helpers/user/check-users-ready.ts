import { getRoomsMap } from '../states';

export const checkUsersReady = (roomName) => {
	const users = getRoomsMap().get(roomName);
	if(users === undefined || users.length <= 0) {
		return false;
	}
	return users.every(user => user.ready);
}