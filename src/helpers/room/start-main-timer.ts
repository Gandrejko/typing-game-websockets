import { decrementTime, getRoomTime } from './index';

export const startMainTimer = (roomName, socket) => {
	const time = getRoomTime(roomName);
	socket.emit("UPDATE_TIMER", { time });

	const timer = setInterval(() => {
		decrementTime(roomName);
		const time = getRoomTime(roomName);
		socket.emit("UPDATE_TIMER", { time });
		if(time !== undefined && time <= 0) {
			clearInterval(timer);
		}
	}, 1000);
}