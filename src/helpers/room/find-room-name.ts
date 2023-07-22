import { User } from '../../types';
import { getRoomsMap } from '../states';

export const findRoomName = (username: string): string => {
	let roomName;
	getRoomsMap().forEach((users: User[], room) => {
		users.find(user => {
			if(user.username === username) {
				roomName = room;
			}
		});
	})

	return roomName
}