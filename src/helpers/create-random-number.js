import { texts } from '../data';

export const createRandomNumber = () => {
  return Math.floor(Math.random() * texts.length);
}