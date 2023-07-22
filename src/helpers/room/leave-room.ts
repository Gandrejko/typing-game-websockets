import { getRoomsMap } from '../../socket';
import { getUsersCount } from '../user/get-users-count';
import { deleteRoom } from './delete-room';
import { removeUserFromRoom } from './remove-user-from-room';

export const leaveRoom = ({roomName, server, username}) => {
	if (!getRoomsMap().has(roomName)) {
		return;
	}

	removeUserFromRoom(roomName, server, username);

	const currentCount = getUsersCount(roomName);

	if (currentCount <= 0) {
		deleteRoom(roomName, server);
	} else {
		server.emit("ROOM_UPDATED", { roomName, numberOfUsers: currentCount });
	}
};