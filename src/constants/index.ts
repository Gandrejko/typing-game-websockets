import { Room, User } from '../types';

export const defaultRoom: Room = {
	users: [],
	time: 0
}

export const defaultUser: User = {
	username: '',
	ready: false,
	speed: null
}