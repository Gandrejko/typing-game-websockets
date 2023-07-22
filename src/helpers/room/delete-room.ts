import { getRoomsMap } from '../../socket';

export const deleteRoom = (roomName, server) => {
	getRoomsMap().delete(roomName);
	server.emit("ROOM_DELETED", { roomName });
};