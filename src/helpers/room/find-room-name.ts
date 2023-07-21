import { RoomName, User, Username } from '../../types';
import { getRoomsMap } from '../states';

export const findRoomName = (username: Username): RoomName => {
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