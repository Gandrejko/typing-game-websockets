import { getRoomsMap } from '../../socket';

export const getRoomsList = () => {
	const roomsMap = getRoomsMap();
	const roomsName = [...roomsMap.keys()];
	return roomsName.map(roomName => [roomName, roomsMap.get(roomName)?.users.length]);
}