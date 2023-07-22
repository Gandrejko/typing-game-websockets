import { defaultUser } from '../../constants';
import { User } from '../../types';

export const createUser = ({ username, ready = false }): User => {
	return {
		...defaultUser,
		username,
		ready: ready,
		speed: null
	}
}