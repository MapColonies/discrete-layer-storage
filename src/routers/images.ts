import { Router } from 'express';
import { container } from 'tsyringe';
import { validate } from 'openapi-validator-middleware';
import { ImagesController } from '../controllers/imagesController';

const imagesRouter = Router();
const controller = container.resolve(ImagesController);

imagesRouter.post('/', validate, controller.create.bind(controller));
imagesRouter.put('/', validate, controller.update.bind(controller));
imagesRouter.get('/:id', validate, controller.get.bind(controller));
imagesRouter.delete('/:id', validate, controller.delete.bind(controller));
imagesRouter.get('/exists/:id', validate, controller.exists.bind(controller));
imagesRouter.post('/search', validate, controller.search.bind(controller));

export { imagesRouter as ImagesRouter };
