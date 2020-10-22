import { Router } from 'express';
import { ImagesRouter } from './images';
import { swaggerRouter } from './swagger';

const globalRouter = Router();
globalRouter.use(swaggerRouter);
globalRouter.use('/images', ImagesRouter);

export { globalRouter };
