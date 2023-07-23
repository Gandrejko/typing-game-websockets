import { roomsMap } from '../../socket/rooms';
import { Room, User } from '../../types';
import { getRoom, setRoom } from '../room';

export const getRoomUsers = (roomName: string): User[] => roomsMap.get(roomName)?.users || [];

export const setRoomUsers = (roomName: string, newUsers: User[]) => {
	const room = getRoom(roomName);
	if(!room) {
		return;
	}
	const newRoom: Room = {
		...room,
		users: newUsers
	};
	setRoom(roomName, newRoom);
};

export const getUser = (roomName: string, username: string) => {
	const roomUsers = getRoomUsers(roomName);
	if(!roomUsers) {
		return;
	}

	return roomUsers.find(user => user.username === username);
}

export const getUserIndex = (roomName: string, username: string) => {
	const roomUsers = getRoomUsers(roomName);
	if(!roomUsers) {
		return -1;
	}
	const user = roomUsers.find(user => user.username === username);
	return roomUsers.indexOf(<User>user)
}
