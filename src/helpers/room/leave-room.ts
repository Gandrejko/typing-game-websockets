import { roomsMap } from '../../socket/rooms';
import { getRoomUsers } from '../user';
import { getUsersCount } from '../user/get-users-count';
import { deleteRoom } from './delete-room';
import { getRoomsList } from './get-rooms-list';
import { removeUserFromRoom } from './remove-user-from-room';

export const leaveRoom = ({roomName, server, username}) => {
	if (!roomsMap.has(roomName)) {
		return;
	}

	removeUserFromRoom(roomName, server, username);

	const roomUsers = getRoomUsers(roomName);

	if (roomUsers.length === 0) {
		deleteRoom(roomName, server);
	} else {
		server.emit("LIST_ROOMS_RESPONSE", getRoomsList());
	}
};