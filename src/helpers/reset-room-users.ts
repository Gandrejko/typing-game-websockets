import { getRoomUsers, setRoomUsers } from './user';

export const resetRoomUsers = (roomName: string) => {
  const roomUsers = getRoomUsers(roomName);
  const newUsers =  roomUsers.map(player => {
    return {
      ...player,
      ready: false,
      speed: null,
    }
  });

  setRoomUsers(roomName, newUsers);
}