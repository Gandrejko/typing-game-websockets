import { SECONDS_FOR_GAME } from '../socket/config';
import { Room, User } from '../types';

export const defaultRoom: Room = {
	users: [],
	time: SECONDS_FOR_GAME
}

export const defaultUser: User = {
	username: '',
	ready: false,
	speed: null
}