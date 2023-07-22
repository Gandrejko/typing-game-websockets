import { SECONDS_TIMER_BEFORE_START_GAME } from '../../socket/config';
import { startGame } from '../start-game';

export const startTimerBeforeGame = (roomName, socket) => {
	let time = SECONDS_TIMER_BEFORE_START_GAME;
	socket.emit("UPDATE_TIMER_BEFORE_GAME", { time });
	const timer = setInterval(() => {
		time--;
		socket.emit("UPDATE_TIMER_BEFORE_GAME", { time });
		if(time !== undefined && time <= 0) {
			startGame(roomName, socket);
			clearInterval(timer);
		}
	}, 1000);

}
