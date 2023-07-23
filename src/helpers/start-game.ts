import { texts } from '../data';
import { createRandomNumber } from './create-random-number';
import { setRoomText } from './room';
import { startMainTimer } from './room/start-main-timer';

export const startGame = (roomName, socket, server) => {
	const text = texts[createRandomNumber()];
	setRoomText(roomName, text);
	server.in(roomName).emit("START_GAME_SUCCESS", { text });
	startMainTimer(roomName, socket, server);
}