import { SECONDS_FOR_GAME } from '../../socket/config';
import { getRoom, setRoom } from './index';

export const resetRoom = (roomName: string) => {
	const room = getRoom(roomName);
	if(!room) {
		return;
	}
	const newRoom = {
		...room,
		text: '',
		time: SECONDS_FOR_GAME,
	}
	setRoom(roomName, newRoom);
}