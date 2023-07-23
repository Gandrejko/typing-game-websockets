import { roomsMap } from '../../socket/rooms';

export const findRoomName = (username: string): string => {
	let roomName;
	roomsMap.forEach(({users}, room) => {
		users.find(user => {
			if(user.username === username) {
				roomName = room;
			}
		});
	})

	return roomName
}