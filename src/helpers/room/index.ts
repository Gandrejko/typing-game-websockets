import { getRoomsMap } from '../../socket';
import { Room } from '../../types';

export const getRoom = (roomName: string): Room | undefined => getRoomsMap().get(roomName);

export const setRoom = (roomName: string, newRoom: Room) => {
	getRoomsMap().set(roomName, newRoom);
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