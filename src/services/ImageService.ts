import { injectable } from 'tsyringe';
import { ImageMetadata } from '@map-colonies/mc-model-types';
import { ConnectionManager } from '../DAL/ConnectionManager';
import { ImageDataRepository } from '../DAL/ImageDataRepository';
import { ImageData } from '../entity/ImageData';

@injectable()
export class ImagesService {
  private repository?: ImageDataRepository;
  public constructor(private readonly connectionManager: ConnectionManager) {}

  public async get(id: string): Promise<ImageMetadata> {
    const repository = await this.getRepository();
    const image = await repository.get(id);
    if (!image) {
      //TODO: replace with custom error type
      throw new Error('image data was not found');
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
    imageMetadata.creationTime = image.date;
    imageMetadata.id = image.id;
    imageMetadata.imageUri = image.imageLocation;
    return imageMetadata;
  }

  private modelToEntity(model: ImageMetadata): ImageData {
    const entity = new ImageData({
      id: model.id,
      date: model.creationTime,
      imageLocation: model.imageUri,
      additionalData: JSON.stringify(model),
    });
    return entity;
  }
}
