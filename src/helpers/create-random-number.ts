import { texts } from '../data';

export const createRandomNumber = (): number => {
  return Math.floor(Math.random() * texts.length);
}