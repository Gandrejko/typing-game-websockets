import { getRoomsMap } from '../../socket';
import { User } from '../../types';

export const findRoomName = (username: string): string => {
	let roomName;
	getRoomsMap().forEach(({users}, room) => {
		users.find(user => {
			if(user.username === username) {
				roomName = room;
			}
		});
	})

	return roomName
}