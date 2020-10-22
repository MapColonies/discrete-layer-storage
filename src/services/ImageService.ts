import { injectable } from 'tsyringe';
import { ImageMetadata } from '@map-colonies/mc-model-types';
import { Geometry } from 'geojson';
import { ConnectionManager } from '../DAL/connectionManager';
import { ImageDataRepository } from '../DAL/imageDataRepository';
import { ImageData } from '../entity/imageData';
import { SearchOptions } from '../models/searchOptions';
import { NotFoundError } from '../exceptions/notFoundError';

@injectable()
export class ImagesService {
  private repository?: ImageDataRepository;
  public constructor(private readonly connectionManager: ConnectionManager) {}

  public async get(id: string): Promise<ImageMetadata> {
    const repository = await this.getRepository();
    const image = await repository.get(id);
    if (!image) {
      throw new NotFoundError('image data was not found');
    }
    return this.entityToModel(image);
  }

  public async exists(id: string): Promise<boolean> {
    const repository = await this.getRepository();
    const image = await repository.get(id);
    return image != null;
  }

  public async create(image: ImageMetadata): Promise<void> {
    const repository = await this.getRepository();
    const imageData = this.modelToEntity(image);
    await repository.createAndSave(imageData);
  }

  public async update(image: ImageMetadata): Promise<void> {
    const repository = await this.getRepository();
    const imageData = this.modelToEntity(image);
    await repository.updateImageDate(imageData);
  }

  public async delete(id: string): Promise<void> {
    const repository = await this.getRepository();
    await repository.deleteImageData(id);
  }

  public async search(options: SearchOptions): Promise<ImageMetadata[]> {
    const repository = await this.getRepository();
    const rawRes = await repository.search(options);
    const res = rawRes.map((value) => this.entityToModel(value));
    return res;
  }

  private async getRepository(): Promise<ImageDataRepository> {
    if (!this.repository) {
      if (!this.connectionManager.isConnected()) {
        await this.connectionManager.init();
      }
      this.repository = this.connectionManager.getImageDataRepository();
    }
    return this.repository;
  }

  private entityToModel(image: ImageData): ImageMetadata {
    const imageMetadata = JSON.parse(image.additionalData) as ImageMetadata;
    imageMetadata.imagingTime = image.imagingTime;
    imageMetadata.id = image.id;
    imageMetadata.imageUri = image.imageLocation;
    imageMetadata.footprint = image.footprint;
    return imageMetadata;
  }

  private modelToEntity(model: ImageMetadata): ImageData {
    const entity = new ImageData({
      id: model.id,
      imagingTime: model.imagingTime,
      imageLocation: model.imageUri,
      additionalData: JSON.stringify(model),
      footprint: model.footprint as Geometry,
    });
    return entity;
  }
}
