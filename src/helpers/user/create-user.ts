import { User } from '../../types';

export const createUser = ({ username, ready = false }): User => {
	return {
		username,
		ready: ready,
		speed: null
	}
}