import { texts } from '../data';
import { createRandomNumber } from './create-random-number';
import { startMainTimer } from './room/start-main-timer';

export const startGame = (roomName, socket) => {
	const text = texts[createRandomNumber()];
	socket.emit("START_GAME_SUCCESS", { text })
	startMainTimer(roomName, socket);
}