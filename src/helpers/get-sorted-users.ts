import { User } from '../types';

export const getSortedUsers = (users: User[]): string[] => {
  return users.sort((a, b) => Number(b.speed) - Number(a.speed)).filter(user => user.speed !== null).map(user => user.username)
}
