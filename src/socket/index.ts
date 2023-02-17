import { Server } from 'socket.io';

const rooms: string[] = [];
const roomsMap = new Map(rooms.map(roomName => [roomName, 0]));
const numberOfUsersDefault = 0;

export default (io: Server) => {
	io.on('connection', socket => {
		const username = socket.handshake.query.username;
		roomsMap.forEach((numberOfUsers, roomName, map) => {
			socket.emit("UPDATE_ROOMS", {roomName, numberOfUsersDefault});
		})

		socket.on("ADD_ROOM", (roomName: string) => {
			rooms.push(roomName);
			roomsMap.set(roomName, numberOfUsersDefault);

			socket.emit("UPDATE_ROOMS", {roomName, numberOfUsersDefault});
			socket.broadcast.emit("UPDATE_ROOMS", {roomName, numberOfUsersDefault});

			socket.join(roomName);
			io.to(socket.id).emit("JOIN_ROOM_DONE", roomName);
		})
	});
};
