import loginRoutes from './loginRoutes';
import gameRoutes from './gameRoutes';
import textRoutes from "./textRoutes";
import { Express } from 'express';

export default (app: Express) => {
	app.use('/login', loginRoutes);
	app.use('/game', gameRoutes);
	app.use('/game/texts', textRoutes);
};
