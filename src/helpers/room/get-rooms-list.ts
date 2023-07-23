import { getRoomsMap } from '../../socket';
import { MAXIMUM_USERS_FOR_ONE_ROOM } from '../../socket/config';

export const getRoomsList = (): [string, number][] => {
	const roomsMap = getRoomsMap();
	const roomsName = [...roomsMap.keys()];

	const roomsList = roomsName.map((roomName): [string, number] => [roomName, roomsMap.get(roomName)?.users.length || MAXIMUM_USERS_FOR_ONE_ROOM]);
	return roomsList.filter(([roomName, numberOfUsers]) => {
		if(numberOfUsers && numberOfUsers < MAXIMUM_USERS_FOR_ONE_ROOM) {
			return [roomName, numberOfUsers];
		}
	});
}