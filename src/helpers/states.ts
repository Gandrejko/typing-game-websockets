import { RoomsMap } from '../types';
import useState from './hooks/use-state';

export const [getRoomsMap, setRoomsMap] = useState<RoomsMap>(new Map());