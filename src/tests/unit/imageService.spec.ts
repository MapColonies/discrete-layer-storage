//this import must be called before the first import of tsyring
import 'reflect-metadata';
import { ImageMetadata } from '@map-colonies/mc-model-types';
import { ImageData } from '../../entity/ImageData';
import { ImagesService } from '../../services/ImageService';
import { ConnectionManager } from '../../DAL/ConnectionManager';

//init constant test data
const model: ImageMetadata = {
  imageUri: 'test/location',
  id: 'testId',
  imagingTime: new Date('1/1/2020'),
  height: 78,
  footprint: {
    type: 'Polygon',
    coordinates: [
      [
        [100, 0],
        [101, 0],
        [101, 1],
        [100, 1],
        [100, 0],
      ],
    ],
  },
};
const entity: ImageData = {
  additionalData:
    '{"imageUri":"test/location","id":"testId","imagingTime":"2019-12-31T22:00:00.000Z","height":78,' +
    '"footprint":{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]}}',
  imagingTime: new Date('1/1/2020'),
  id: 'testId',
  imageLocation: 'test/location',
  footprint: {
    type: 'Polygon',
    coordinates: [
      [
        [100, 0],
        [101, 0],
        [101, 1],
        [100, 1],
        [100, 0],
      ],
    ],
  },
};

describe('Image service test', () => {
  let imagesService: ImagesService;

  beforeEach(() => {
    imagesService = new ImagesService({} as ConnectionManager);
  });

  it('model to entity conversion should return entity with all model data', () => {
    //bypass private protection of tested function
    const service = (imagesService as unknown) as {
      modelToEntity: (model: ImageMetadata) => ImageData;
    };
    //test
    const actualEntity = service.modelToEntity(model);
    expect(actualEntity).toEqual(entity);
  });

  it('entity to model conversion should return model with all entity data', () => {
    //bypass private protection of tested function
    const service = (imagesService as unknown) as {
      entityToModel: (entity: ImageData) => ImageMetadata;
    };
    //test
    const actualModel = service.entityToModel(entity);
    expect(actualModel).toEqual(model);
  });
});
