import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';
import { ImageMetadata, ApiHttpResponse } from '@map-colonies/mc-model-types';
import { ImagesService } from '../services/ImageService';
import { SearchOptions } from '../models/searchOptions';

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
    return res.status(httpStatus.OK).json(body);
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const image = req.body as ImageMetadata;
    await this.service.update(image);
    const body: ApiHttpResponse = {
      success: true,
    };
    return res.status(httpStatus.OK).json(body);
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const id = req.params['id'];
    await this.service.delete(id);
    const body: ApiHttpResponse = {
      success: true
    };
    return res.status(httpStatus.OK).json(body);
  }

  public async exists(req: Request, res: Response): Promise<Response> {
    const id = req.params['id'];
    const exist = await this.service.exists(id);
    const body: ApiHttpResponse = {
      success: true,
      data: {
        exists: exist,
      },
    };
    return res.status(httpStatus.OK).json(body);
  }

  public async search(req: Request, res: Response): Promise<Response> {
    const options = req.body as SearchOptions;
    const data = await this.service.search(options);
    const body: ApiHttpResponse = {
      success: true,
      data: {
        matchingImages: data,
      },
    };
    return res.status(httpStatus.OK).json(body);
  }
}
