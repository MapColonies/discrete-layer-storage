import { Repository, EntityRepository } from 'typeorm';
import { delay, inject } from 'tsyringe';
import { MCLogger } from '@map-colonies/mc-logger';
import { ImageData } from '../entity/ImageData';

@EntityRepository(ImageData)
export class ImageDataRepository extends Repository<ImageData> {
  public constructor(
    @inject(delay(() => MCLogger)) private readonly logger: MCLogger
  ) {
    super();
  }

  public async get(id: string): Promise<ImageData | undefined> {
    return this.findOne({ id: id });
  }

  public async createAndSave(image: ImageData): Promise<void> {
    const exists = (await this.get(image.id)) != undefined;
    if (!exists) {
      await this.save(image);
    } else {
      this.logger.info('duplicate value error has occurred');
      //TODO: replace with custom exception type and handle in service
      throw new Error('duplicate entry inserted');
    }
  }

  public async updateImageDate(image: ImageData): Promise<void> {
    const exists = (await this.get(image.id)) != null;
    if (exists) {
      await this.save(image);
    } else {
      this.logger.info('attempt to update non existing record has occurred');
      //TODO: replace with custom exception type and handle in service
      throw new Error('invalid update');
    }
  }

  public async deleteImageData(id: string): Promise<void> {
    const image = await this.get(id);
    if (image) {
      await this.delete({ id: id });
    } else {
      this.logger.info('attempt to delete non existing record has occurred');
      //TODO: replace with custom exception type and handle in service
      throw new Error('image to delete was not found');
    }
  }
}
