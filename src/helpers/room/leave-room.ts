import { roomsMap } from '../../socket/rooms';
import { startGame } from '../start-game';
import { getRoomUsers } from '../user';
import { checkUsersReady } from '../user/check-users-ready';
import { deleteRoom } from './delete-room';
import { getRoomsList } from './get-rooms-list';
import { removeUserFromRoom } from './remove-user-from-room';

export const leaveRoom = ({roomName, server, username, socket}) => {
	if (!roomsMap.has(roomName)) {
		return;
	}
	socket.leave(roomName);

	removeUserFromRoom(roomName, server, username);

	if(checkUsersReady(roomName)) {
		startGame(roomName, socket, server);
	}

	const roomUsers = getRoomUsers(roomName);

	if (roomUsers.length === 0) {
		deleteRoom(roomName, server);
	} else {
		server.emit("LIST_ROOMS_RESPONSE", getRoomsList());
	}
};