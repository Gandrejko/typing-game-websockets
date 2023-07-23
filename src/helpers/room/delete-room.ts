import { roomsMap } from '../../socket/rooms';

export const deleteRoom = (roomName, server) => {
	roomsMap.delete(roomName);
	server.emit("ROOM_DELETED", { roomName });
};