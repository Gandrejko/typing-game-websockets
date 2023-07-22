import { User } from '../types';

export const setPlayerSpeed = (roomUsers: User[], username: string, lettersCount: number, time: number) => {
  return roomUsers.map(user => {
	  if(user.username === username) {
		user = {
		  ...user,
		  speed: +(lettersCount / time).toFixed(2)
		}
	  }

	  return user
  })
}