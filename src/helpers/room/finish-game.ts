import { SECONDS_FOR_GAME } from '../../socket/config';
import { getSortedUsers } from '../get-sorted-users';
import { resetRoomUsers } from '../reset-room-users';
import { setPlayerSpeed } from '../set-player-speed';
import { getRoomUsers } from '../user';
import { getRoomText } from './index';
import { resetRoom } from './reset-room';

export const finishGame = (roomName, server) => {
	const roomUsers = getRoomUsers(roomName);

	const roomTextLength = getRoomText(roomName)?.length;
	roomUsers.forEach(user => {
		if(user.speed === null && roomTextLength !== undefined) {
			setPlayerSpeed(roomName, roomUsers, user.username, roomTextLength, SECONDS_FOR_GAME);
		}
		return user;
	});
	const updatedUsers = getRoomUsers(roomName);
	server.in(roomName).emit("GAME_FINISHED", { usersSortedArray: getSortedUsers(updatedUsers), roomName });

	resetRoom(roomName);
	resetRoomUsers(roomName);
}