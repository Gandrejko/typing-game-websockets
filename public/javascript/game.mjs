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

const startTimerBeforeGame = () => {
	const timerElement = document.getElementById('timer');
	removeClass(timerElement, 'display-none');
	removeButtons();
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

const hidePreGameTimer = () => {
	const timerElement = document.getElementById('timer');

	addClass(timerElement, 'display-none');
}

const showGameTimer = () => {
	const gameTimerElement = document.getElementById('game-timer');

	removeClass(gameTimerElement, 'display-none');
}

const startGame = ({ text }) => {
	hidePreGameTimer();
	showGameTimer();
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

const updateTimerBeforeGame = ({ time }) => {
	const timerElement = document.getElementById('timer');

	timerElement.innerText = time;
}

const updateTimer = ({ time }) => {
	const gameTimerValue = document.getElementById('game-timer-seconds');

	gameTimerValue.innerText = time;
}

socket.on("PROGRESS_UPDATED_SUCCESS", setProgress);
socket.on("START_GAME_SUCCESS", startGame);
socket.on("ALL_PLAYERS_READY", startTimerBeforeGame);
socket.on("UPDATE_TIMER", updateTimer);
socket.on("UPDATE_TIMER_BEFORE_GAME", updateTimerBeforeGame);
