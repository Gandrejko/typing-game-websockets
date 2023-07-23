import { finishGame } from './finish-game';
import { decrementTime, getRoomTime } from './index';

export const startMainTimer = (roomName, socket, server) => {
	const time = getRoomTime(roomName);
	server.in(roomName).emit("UPDATE_TIMER", { time });

	const timer = setInterval(() => {
		decrementTime(roomName);
		const time = getRoomTime(roomName);
		server.in(roomName).emit("UPDATE_TIMER", { time });
		if(time !== undefined && time <= 0) {
			finishGame(roomName, server);
			clearInterval(timer);
		}
	}, 1000);
}