import { SECONDS_TIMER_BEFORE_START_GAME } from '../../socket/config';
import { startGame } from '../start-game';

export const startTimerBeforeGame = (roomName, socket, server) => {
	let time = SECONDS_TIMER_BEFORE_START_GAME;
	server.in(roomName).emit("UPDATE_TIMER_BEFORE_GAME", { time });
	const timer = setInterval(() => {
		time--;
		server.in(roomName).emit("UPDATE_TIMER_BEFORE_GAME", { time });
		if(time !== undefined && time <= 0) {
			startGame(roomName, socket, server);
			clearInterval(timer);
		}
	}, 1000);
}
