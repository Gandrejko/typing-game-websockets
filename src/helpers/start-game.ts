import { texts } from '../data';
import { createRandomNumber } from './create-random-number';
import { setRoomText } from './room';
import { startMainTimer } from './room/start-main-timer';
import { startTimerBeforeGame } from './room/start-timer-before-game';

export const startGame = (roomName, socket, server) => {
	const text = texts[createRandomNumber()];
	setRoomText(roomName, text);
	startTimerBeforeGame(roomName, socket, server, text);
}