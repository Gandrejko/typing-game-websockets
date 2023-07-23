import { MAXIMUM_USERS_FOR_ONE_ROOM } from '../../socket/config';
import { roomsMap } from '../../socket/rooms';
import { getRoomUsers } from '../user';
import { getUsersCount } from '../user/get-users-count';
import { addUserToRoom } from './add-user-to-room';
import { getRoomsList } from './get-rooms-list';

export const joinRoom = ({roomName, server, socket, username}) => {
	if (!roomsMap.has(roomName)) {
		return;
	}

	socket.emit("LIST_USERS_RESPONSE", getRoomUsers(roomName));
	addUserToRoom(roomName, server, socket, username);

	const currentCount = getUsersCount(roomName);
	if (currentCount >= MAXIMUM_USERS_FOR_ONE_ROOM) {
		server.emit("REMOVE_ROOM", roomName);
	} else {
		server.emit("LIST_ROOMS_RESPONSE", getRoomsList());
	}
};