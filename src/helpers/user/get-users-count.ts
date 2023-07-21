import { getRoomsMap } from '../states';

export const getUsersCount = (roomName) => {
	return getRoomsMap().get(roomName)?.length || 0
}