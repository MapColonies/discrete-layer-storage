import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';
import {
  ImageMetadata,
  ApiHttpResponse,
  ApiHttpError,
} from '@map-colonies/mc-model-types';
import { ImagesService } from '../services/ImageService';

@injectable()
export class ImagesController {
  public constructor(private readonly service: ImagesService) {}

  public async create(req: Request, res: Response): Promise<Response> {
    const image = req.body as ImageMetadata;
    await this.service.create(image);
    const body: ApiHttpResponse = {
      success: true,
    };
    return res.status(httpStatus.OK).json(body);
  }

  public async get(req: Request, res: Response): Promise<Response> {
    const id = req.params['id'];
    const data = await this.service.get(id);
    const body: ApiHttpResponse = {
      success: true,
      data: data,
    };
    return res;
  }

  public update(req: Request, res: Response): Response {
    return res;
  }

  public delete(req: Request, res: Response): Response {
    return res;
  }

  public exists(req: Request, res: Response): Response {
    return res;
  }
}
