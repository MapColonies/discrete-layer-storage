import { Router } from 'express';
import { ImagesRouter } from './Images';
import { swaggerRouter } from './swagger';

const globalRouter = Router();
globalRouter.use(swaggerRouter);
globalRouter.use('/images', ImagesRouter);

export { globalRouter };
