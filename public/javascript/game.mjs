import { addClass, createElement, removeClass } from './helpers/domHelper.mjs';
import {setProgress} from './views/user.mjs';

import socket from './socket.standalone.mjs';

let time = 0;

const removeButtons = () => {
	const quitRoomBtn = document.getElementById("quit-room-btn");
	const readyBtn = document.getElementById('ready-btn');

	addClass(quitRoomBtn, 'display-none');
	addClass(readyBtn, 'display-none');
}

const startTimerBeforeGame = ({roomName, time}) => {
	const timerElement = document.getElementById('timer');
	removeClass(timerElement, 'display-none');
	removeButtons();

	let currTime = time;
	timerElement.innerText = currTime;
	const timer = setInterval(() => {
		currTime--;
		timerElement.innerText = currTime;
		if(currTime <= 0) {
			clearInterval(timer);
			socket.emit("START_GAME", roomName)
		}
	}, 1000)
}

const setupText = (text = '') => {
	const textContainer = document.getElementById('text-container');
	removeClass(textContainer, 'display-none');
	textContainer.innerHTML = '';

	text.split('').map(letter => {
		const letterElement = createElement({
			tagName: "span",
			className: "letter",
			innerElements: [letter],
		});
		textContainer.append(letterElement);
	})
}

const calcProgressBar = (text) => {
	const letterElements = document.querySelectorAll('.letter.success');
	const countSuccessLetters = letterElements.length;
	return (countSuccessLetters / text.length) * 100
}

const startGame = async ({ gameDuration }) => {
	const text = await getText(0);
	await startTimer({gameDuration, text});
	setupText(text);
	const letters = document.querySelectorAll('.letter');
	let currIndex = 0;
	const typeEvent = (e) => {
		const letterKeys = [
			'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
			'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
			'z', 'x', 'c', 'v', 'b', 'n', 'm',
			'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
			'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
			'Z', 'X', 'C', 'V', 'B', 'N', 'M',
			'.', ',', ' ', '?', '!', '\'', '"', 'Backspace'
		];
		const key = e.key;

		if(!letterKeys.includes(key)) {
			return;
		}
		if(key === 'Backspace' && currIndex > 0) {
			currIndex--;
			removeClass(letters[currIndex + 1], 'next');
			removeClass(letters[currIndex], 'success fail');
			addClass(letters[currIndex], 'next');
			return;
		} else if(key === letters[currIndex].innerHTML) {
			removeClass(letters[currIndex], 'next');
			addClass(letters[currIndex], 'success');
			const progress = calcProgressBar(text);
			socket.emit("PROGRESS_UPDATED", progress);
			if(progress === 100) {
				socket.emit("PLAYER_FINISHED", { lettersCount: text.length, time });
			}

		} else {
			return
		}
		letters[currIndex + 1] && addClass(letters[currIndex + 1], 'next');
		currIndex++;
	}
	window.addEventListener('keydown', typeEvent);
	socket.on("GAME_FINISHED_SUCCESS", () => removeEventListener('keydown', typeEvent));
	socket.on("PLAYER_FINISHED_SUCCESS", () => removeEventListener('keydown', typeEvent));
}

const startTimer = ({gameDuration, text}) => {
	const gameTimerElement = document.getElementById('game-timer');
	const gameTimerValue = document.getElementById('game-timer-seconds');

	const timerElement = document.getElementById('timer');


	addClass(timerElement, 'display-none');
	removeClass(gameTimerElement, 'display-none');
	time = 0;
	let currTime = gameDuration - time;
	gameTimerValue.innerText = currTime.toString();
	const timer = setInterval(() => {
		time++;
		currTime = gameDuration - time;
		gameTimerValue.innerText = currTime;
		if(currTime <= 0) {
			clearInterval(timer);
			socket.emit("GAME_FINISHED", { lettersCount: text.length, time });
		}
		socket.on("GAME_FINISHED_SUCCESS", () => clearInterval(timer));
	}, 1000)
}

const getText = async (randomNumber) => {
	try {
		const res = await fetch(`http://localhost:3002/game/texts/${randomNumber}`);
		return await res.text()
	} catch (error) {
		console.log(error)
	}
}

socket.on("PROGRESS_UPDATED_SUCCESS", setProgress);
socket.on("START_GAME_SUCCESS", startGame);
socket.on("START_TIMER_BEFORE_GAME", startTimerBeforeGame);