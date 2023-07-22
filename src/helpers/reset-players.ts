import { User } from '../types';

export const resetPlayers = (players: User[]): User[] => {
  return players.map(player => {
    return {
      ...player,
      ready: false,
      speed: null,
    }
  })
}