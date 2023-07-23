import { roomsMap } from '../../socket/rooms';
import { Room } from '../../types';

export const getRoom = (roomName: string): Room | undefined => roomsMap.get(roomName);

export const setRoom = (roomName: string, newRoom: Room) => {
	roomsMap.set(roomName, newRoom);
}

export const getRoomTime = (roomName: string): number | undefined => getRoom(roomName)?.time;

export const setRoomTime = (roomName: string, newTime: number) => {
	const room = getRoom(roomName);
	if(!room) {
		return;
	}
	const newRoom = {
		...room,
		time: newTime,
	}
	setRoom(roomName, newRoom);
}

export const decrementTime = (roomName) => {
	const currTime = getRoomTime(roomName);
	if(!currTime) {
		return;
	}
	const newTime = currTime - 1;
	setRoomTime(roomName, newTime)
}

export const getRoomText = (roomName: string): string | undefined => getRoom(roomName)?.text;

export const setRoomText = (roomName: string, newText: string) => {
	const room = getRoom(roomName);
	if(!room) {
		return;
	}
	const newRoom = {
		...room,
		text: newText,
	}
	setRoom(roomName, newRoom);
}