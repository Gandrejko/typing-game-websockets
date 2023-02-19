import { Server } from 'socket.io';

const rooms: string[] = [];
const roomsMap = new Map(rooms.map(roomName => [roomName, 0]));
const numberOfUsersDefault = 0;

const updateRooms = (socket) => {
	deleteVoidRooms();
	roomsMap.forEach((numberOfUsers, roomName) => {
		socket.emit("UPDATE_ROOMS", {roomName, numberOfUsers});
		socket.broadcast.emit("UPDATE_ROOMS", {roomName, numberOfUsers});
	})
}

const deleteVoidRooms = () => {
	roomsMap.forEach((numberOfUsers, roomName) => {
		if(roomName && numberOfUsers === 0) {
			roomsMap.delete(roomName);
		}
	})
}

const updateNumberOfUsers = (roomName, joined) => {
	const numberOfUsers = roomsMap.get(roomName);
	const diff = joined ? 1 : -1;

	if(numberOfUsers !== undefined) {
		roomsMap.set(roomName, numberOfUsers + diff);
	}
}

export default (io: Server) => {
	io.on('connection', socket => {
		const username = socket.handshake.query.username;
		updateRooms(socket);

		socket.on("ADD_ROOM", (roomName: string) => {
			if(roomsMap.has(roomName)) {
				socket.emit("SHOW_MODAL", {message: `Room with name "${roomName}" already exist`});
				return;
			}
			const numberOfUsers = numberOfUsersDefault;
			rooms.push(roomName);
			roomsMap.set(roomName, numberOfUsers);

			socket.emit("UPDATE_ROOMS", {roomName, numberOfUsers});
			socket.broadcast.emit("UPDATE_ROOMS", {roomName, numberOfUsers});
		})

		socket.on("JOIN_ROOM", (roomName: string) => {
			socket.join(roomName);
			io.to(socket.id).emit("JOIN_ROOM_DONE", roomName);

			socket.emit("ADD_USER", { username, ready: false, isCurrentUser: true });

			updateNumberOfUsers(roomName, true);
			updateRooms(socket);
		})

		socket.on("LEAVE_ROOM", (roomName: string) => {
			socket.leave(roomName);
			io.to(socket.id).emit("LEAVE_ROOM_DONE", roomName);

			updateNumberOfUsers(roomName, false);
			updateRooms(socket);
		})
	});
};
