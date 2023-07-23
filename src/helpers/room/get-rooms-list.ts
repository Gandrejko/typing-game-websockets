import { MAXIMUM_USERS_FOR_ONE_ROOM } from '../../socket/config';
import { roomsMap } from '../../socket/rooms';

export const getRoomsList = () => {
	const roomsArray = [...roomsMap.entries()];

	const roomsList = roomsArray.map(([roomName, {users, text, time}]) => {
		const numberOfUsers = users.length;
		if(users && users.length < MAXIMUM_USERS_FOR_ONE_ROOM && text.length === 0) {
			return [roomName, numberOfUsers];
		}
	});
	return roomsList.filter(room => room !== undefined);
}