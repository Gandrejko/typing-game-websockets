import socket from "./socket.standalone.mjs";
import {addClass, removeClass} from "./helpers/domHelper.mjs";

const removeBtns = () => {
	const quitRoomBtn = document.getElementById("quit-room-btn");
	const readyBtn = document.getElementById('ready-btn');

	addClass(quitRoomBtn, 'display-none');
	addClass(readyBtn, 'display-none');
}

const startTimerBeforeGame = (time) => {
	const timerElement = document.getElementById('timer');
	removeClass(timerElement, 'display-none');
	removeBtns();

	let currTime = time;
	timerElement.innerText = currTime;
	const timer = setInterval(() => {
		currTime--;
		timerElement.innerText = currTime;
		if(currTime <= 0) {
			clearInterval(timer);
			socket.emit("START_TIMER")
		}
	}, 1000)
}

const startTimer = async ({time}) => {
	const gameTimerElement = document.getElementById('game-timer');
	const gameTimerValue = document.getElementById('game-timer-seconds');
	const textContainer = document.getElementById('text-container');
	const timerElement = document.getElementById('timer');
	const text = await getText();

	addClass(timerElement, 'display-none');
	removeClass(gameTimerElement, 'display-none');
	removeClass(textContainer, 'display-none');

	textContainer.innerText = text;

	let currTime = time;
	gameTimerValue.innerText = currTime;
	const timer = setInterval(() => {
		currTime--;
		gameTimerValue.innerText = currTime;
		if(currTime <= 0) {
			clearInterval(timer);
		}
	}, 1000)
}

const getText = async () => {
	const randomIndex = Math.floor(Math.random() * 5);
	try {
		const res = await fetch(`http://localhost:3002/game/texts/${randomIndex}`);
		return await res.text()
	} catch (error) {
		console.log(error)
	}
}



socket.on("START_TIMER_SUCCESS", startTimer)
socket.on("START_TIMER_BEFORE_GAME", startTimerBeforeGame)