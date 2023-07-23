import { User } from '../types';
import { setRoomUsers } from './user';

export const setPlayerSpeed = (roomName: string, roomUsers: User[], username: string, lettersCount: number, time: number) => {
  const newUsers = roomUsers.map(user => {
	  if(user.username === username) {
		user = {
		  ...user,
		  speed: +(lettersCount / time).toFixed(2)
		}
	  }

	  return user
  })
	setRoomUsers(roomName, newUsers);
}