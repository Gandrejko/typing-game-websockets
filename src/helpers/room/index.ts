import { getRoomsMap } from '../../socket';
import { Room } from '../../types';

export const getRoom = (roomName: string): Room | undefined => getRoomsMap().get(roomName);

export const setRoom = (roomName: string, newRoom: Room) => {
	getRoomsMap().set(roomName, newRoom);
}