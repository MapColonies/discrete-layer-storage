import { Repository, EntityRepository, SelectQueryBuilder } from 'typeorm';
import { container } from 'tsyringe';
import { MCLogger } from '@map-colonies/mc-logger';
import { Geometry } from 'geojson';
import config from 'config';
import { ImageData } from '../entity/imageData';
import { OrderField, SearchOptions } from '../models/searchOptions';
import { ConflictError } from '../exceptions/conflictError';
import { NotFoundError } from '../exceptions/notFoundError';

@EntityRepository(ImageData)
export class ImageDataRepository extends Repository<ImageData> {
  private readonly mcLogger: MCLogger; //don't override internal repository logger.
  private readonly defaultSearchPageSize: number;

  public constructor() {
    super();
    this.mcLogger = container.resolve(MCLogger); //direct injection don't work here due to being initialized by typeOrm
    this.defaultSearchPageSize = config.get<number>('search.defaultPageSize');
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
      this.mcLogger.info(
        `duplicate value error has occurred when creating image "${image.id}"`
      );
      throw new ConflictError(
        `duplicate entry: record with id "${image.id}" already exists.`
      );
    }
  }

  public async updateImageDate(image: ImageData): Promise<void> {
    const exists = (await this.get(image.id)) != null;
    if (exists) {
      this.mcLogger.info(`updating ImageData record with id: ${image.id}`);
      await this.save(image);
    } else {
      this.mcLogger.info(
        `attempt to update non existing record "${image.id}" has occurred`
      );
      throw new NotFoundError(
        `invalid update: record with id "${image.id}" was not found.`
      );
    }
  }

  public async deleteImageData(id: string): Promise<void> {
    const image = await this.get(id);
    if (image) {
      this.mcLogger.info(`deleting ImageData record with id: ${image.id}`);
      await this.delete({ id: id });
    } else {
      this.mcLogger.info(
        `attempt to delete non existing record "${id}" has occurred`
      );
      throw new NotFoundError('image to delete was not found');
    }
  }

  public async search(options: SearchOptions): Promise<ImageData[]> {
    let builder = this.createQueryBuilder('image');
    builder = this.addSearchFilters(options, builder);
    builder = this.addSearchOrder(options, builder);
    builder = this.addPagination(options, builder);
    return builder.getMany();
  }

  private addSearchFilters(
    options: SearchOptions,
    builder: SelectQueryBuilder<ImageData>
  ): SelectQueryBuilder<ImageData> {
    let first = true;
    if (options.geometry) {
      builder = this.addFootprintFilter(builder, options.geometry, first);
      first = false;
    }
    if (options.startDate) {
      builder = this.addStartDate(builder, options.startDate, first);
      first = false;
    }
    if (options.endDate) {
      builder = this.addEndDate(builder, options.endDate, first);
      first = false;
    }
    return builder;
  }

  private addSearchOrder(
    options: SearchOptions,
    builder: SelectQueryBuilder<ImageData>
  ): SelectQueryBuilder<ImageData> {
    let order: 'ASC' | 'DESC' = 'DESC';
    let orderBy: OrderField = OrderField.IMAGING_TIME;
    if (options.sort) {
      if (!options.sort.desc) {
        order = 'ASC';
      }
      orderBy = options.sort.orderBy;
    }
    const orderByColumn = `image.${orderBy.toString()}`;
    builder = builder.orderBy(orderByColumn, order);
    return builder;
  }

  private addPagination(
    options: SearchOptions,
    builder: SelectQueryBuilder<ImageData>
  ): SelectQueryBuilder<ImageData> {
    const defaultPageSize = this.defaultSearchPageSize;
    const pageSize = options.pageSize ?? defaultPageSize;
    builder = builder.limit(pageSize);
    if (options.offset != undefined) {
      builder = builder.offset(options.offset);
    }
    return builder;
  }

  private addFootprintFilter(
    builder: SelectQueryBuilder<ImageData>,
    geometry: Geometry,
    first: boolean
  ): SelectQueryBuilder<ImageData> {
    const filter =
      'ST_Intersects(image.footprint, ST_SetSRID(ST_GeomFromGeoJSON(:geometry),4326))';
    builder = first ? builder.where(filter) : builder.andWhere(filter);
    return builder.setParameter('geometry', geometry);
  }

  private addStartDate(
    builder: SelectQueryBuilder<ImageData>,
    startDate: Date,
    first: boolean
  ): SelectQueryBuilder<ImageData> {
    const filter = 'image.imagingTime >= :startDate';
    builder = first ? builder.where(filter) : builder.andWhere(filter);
    return builder.setParameter('startDate', startDate);
  }

  private addEndDate(
    builder: SelectQueryBuilder<ImageData>,
    endDate: Date,
    first: boolean
  ): SelectQueryBuilder<ImageData> {
    const filter = 'image.imagingTime <= :endDate';
    builder = first ? builder.where(filter) : builder.andWhere(filter);
    return builder.setParameter('endDate', endDate);
  }
}
