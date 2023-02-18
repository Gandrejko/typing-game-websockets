import { Server } from 'socket.io';

const rooms: string[] = [];
const roomsMap = new Map(rooms.map(roomName => [roomName, 0]));
const numberOfUsersDefault = 0;
console.log(roomsMap)
export default (io: Server) => {
	io.on('connection', socket => {
		const username = socket.handshake.query.username;
		roomsMap.forEach((numberOfUsers, roomName, map) => {
			if(numberOfUsers > 0) {
				socket.emit("UPDATE_ROOMS", {roomName, numberOfUsers});
			}
		})

		socket.on("ADD_ROOM", (roomName: string) => {
			const numberOfUsers = numberOfUsersDefault + 1;
			rooms.push(roomName);
			roomsMap.set(roomName, numberOfUsers);

			socket.emit("UPDATE_ROOMS", {roomName, numberOfUsers});
			socket.broadcast.emit("UPDATE_ROOMS", {roomName, numberOfUsers});

			socket.join(roomName);
			io.to(socket.id).emit("JOIN_ROOM_DONE", roomName);
		})

		socket.on("LEAVE_ROOM", (roomName: string) => {
			socket.leave(roomName);
			io.to(socket.id).emit("LEAVE_ROOM_DONE", roomName);
		})
	});
};
