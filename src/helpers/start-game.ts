import { texts } from '../data';
import { createRandomNumber } from './create-random-number';
import { getRoom, setRoomText } from './room';
import { getRoomsList } from './room/get-rooms-list';
import { startTimerBeforeGame } from './room/start-timer-before-game';

export const startGame = (roomName, socket, server) => {
	const text = texts[createRandomNumber()];
	setRoomText(roomName, text);
	server.emit("REMOVE_ROOM", roomName);
	startTimerBeforeGame(roomName, socket, server, text);
}