import { Repository, EntityRepository } from 'typeorm';
import { container } from 'tsyringe';
import { MCLogger } from '@map-colonies/mc-logger';
import { ImageData } from '../entity/ImageData';

@EntityRepository(ImageData)
export class ImageDataRepository extends Repository<ImageData> {

  private readonly mcLogger: MCLogger; //don't override internal repository logger.

  public constructor(
  ) {
    super();
    this.mcLogger = container.resolve(MCLogger); //direct injection don't work here due to being initialized by typeOrm
  }

  public async get(id: string): Promise<ImageData | undefined> {
    return this.findOne({ id: id });
  }

  public async createAndSave(image: ImageData): Promise<void> {
    const exists = (await this.get(image.id)) != undefined;
    if (!exists) {
      this.mcLogger.info(`creating ImageData record with id: ${image.id}`);
      await this.save(image);
    } else {
      this.mcLogger.info('duplicate value error has occurred');
      //TODO: replace with custom exception type and handle in service
      throw new Error('duplicate entry inserted');
    }
  }

  public async updateImageDate(image: ImageData): Promise<void> {
    const exists = (await this.get(image.id)) != null;
    if (exists) {
      this.mcLogger.info(`updating ImageData record with id: ${image.id}`);
      await this.save(image);
    } else {
      this.mcLogger.info('attempt to update non existing record has occurred');
      //TODO: replace with custom exception type and handle in service
      throw new Error('invalid update');
    }
  }

  public async deleteImageData(id: string): Promise<void> {
    const image = await this.get(id);
    if (image) {
      this.mcLogger.info(`deleting ImageData record with id: ${image.id}`);
      await this.delete({ id: id });
    } else {
      this.mcLogger.info('attempt to delete non existing record has occurred');
      //TODO: replace with custom exception type and handle in service
      throw new Error('image to delete was not found');
    }
  }
}
