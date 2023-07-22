import { getRoomsMap } from '../../socket';
import { MAXIMUM_USERS_FOR_ONE_ROOM } from '../../socket/config';
import { getRoomUsers } from '../user';
import { getUsersCount } from '../user/get-users-count';
import { addUserToRoom } from './add-user-to-room';

export const joinRoom = ({roomName, server, socket, username}) => {
	if (!getRoomsMap().has(roomName)) {
		return;
	}

	socket.emit("LIST_USERS_RESPONSE", getRoomUsers(roomName));
	addUserToRoom(roomName, server, socket, username);

	const currentCount = getUsersCount(roomName);
	if (currentCount >= MAXIMUM_USERS_FOR_ONE_ROOM) {
		server.emit("FULL_ROOM", roomName);
	} else {
		server.emit("ROOM_UPDATED", { roomName, numberOfUsers: currentCount });
	}
};