import { getRoomUsers } from './index';

export const getUsersCount = (roomName) => {
	return getRoomUsers(roomName)?.length || 0
}