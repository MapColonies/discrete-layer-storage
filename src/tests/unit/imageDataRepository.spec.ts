//this import must be called before the first import of tsyring
import 'reflect-metadata';
import { container } from 'tsyringe';
import { MCLogger } from '@map-colonies/mc-logger';
import { ImageDataRepository } from '../../DAL/ImageDataRepository';
import { ImageData } from '../../entity/ImageData';
import { SearchOptions } from '../../models/searchOptions'
import e from 'express';
interface SearchOption {
  query:string,
  parameters: [{
    key:string,
    value: unknown
  }]
}

const data = new ImageData();

describe('Image repository test', () => {
  let loggerMock: MCLogger;
  let imagesRepo: ImageDataRepository;

  beforeEach(() => {
    loggerMock = ({
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown) as MCLogger;
    container.clearInstances();
    container.registerInstance<MCLogger>(MCLogger, loggerMock);
    imagesRepo = new ImageDataRepository();
    //mock db calls
    imagesRepo.findOne = jest.fn();
    imagesRepo.save = jest.fn();
    imagesRepo.delete = jest.fn();
    imagesRepo.update = jest.fn();
  });

  it('create should throw if value exists', async () => {
    (imagesRepo.findOne as jest.Mock).mockResolvedValue(data);
    //test
    await expect(async () => {
      await imagesRepo.createAndSave(data);
    }).rejects.toThrow();
  });

  it('create should not throw if value dont exist', async () => {
    (imagesRepo.findOne as jest.Mock).mockResolvedValue(undefined);
    //test
    await expect(imagesRepo.createAndSave(data)).resolves.not.toThrow();
  });

  it('update should throw if value dont exist', async () => {
    (imagesRepo.findOne as jest.Mock).mockResolvedValue(undefined);
    //test
    await expect(imagesRepo.updateImageDate(data)).rejects.toThrow();
  });

  it('update should not throw if value exists', async () => {
    (imagesRepo.findOne as jest.Mock).mockResolvedValue(data);
    //test
    await expect(imagesRepo.updateImageDate(data)).resolves.not.toThrow();
  });

  it('delete should not throw if value exists', async () => {
    (imagesRepo.findOne as jest.Mock).mockResolvedValue(data);
    //test
    await expect(imagesRepo.deleteImageData('')).resolves.not.toThrow();
  });

  it('delete should throw if value dont exist', async () => {
    (imagesRepo.findOne as jest.Mock).mockResolvedValue(undefined);
    //test
    await expect(imagesRepo.deleteImageData('')).rejects.toThrow();
  });

  it('search should use all given conditions', async () =>{
    //generate mocks
    const queryBuilder = {
      where: jest.fn(),
      setParameter: jest.fn(),
      getMany: jest.fn()
    }
    queryBuilder.where.mockReturnValue(queryBuilder);
    queryBuilder.setParameter.mockReturnValue(queryBuilder);
    const getQueryBuilder = jest.fn();
    getQueryBuilder.mockReturnValue(queryBuilder);
    imagesRepo.createQueryBuilder = getQueryBuilder;
    //search options
    const footprintOption: SearchOption = {
      query:'ST_Intersects(image.footprint, ST_SetSRID(ST_GeomFromGeoJSON(:footprint),4326))',
      parameters: [
        {key: 'footprint', value: {
          type: "Point",
          coordinates: [100.5, 0.5]
        }}
      ]
    };

    const optionsList = [footprintOption];
    
    //loop on all search condition combinations
    const iterator = subsets<SearchOption>(optionsList);
    let options = iterator.next();
    while(options.done != undefined && !options.done){
      //clear mocks
      queryBuilder.setParameter.mockClear();
      queryBuilder.where.mockClear();
      queryBuilder.getMany.mockClear();
      getQueryBuilder.mockClear();
      //test
      const searchOptions = buildSearchOptions(options.value);
      await imagesRepo.search(searchOptions);
      expect(getQueryBuilder).toHaveBeenCalledTimes(1);
      expect(queryBuilder.where).toHaveBeenCalledTimes(options.value.length);
      let paramCount =0;
      for (const opt of options.value){
        expect(queryBuilder.where).toHaveBeenCalledWith(opt.query);
        paramCount += opt.parameters.length;
        for (const param of opt.parameters){
          expect(queryBuilder.setParameter).toHaveBeenCalledWith(param.key,param.value);
        }
      }
      expect(queryBuilder.setParameter).toHaveBeenCalledTimes(paramCount);

      options = iterator.next();
      expect(queryBuilder.getMany).toHaveBeenCalledTimes(1);
    }
  });


});

// Generate all array subsets:
function* subsets<T>(array: T[], offset = 0): IterableIterator<T[]> {
  const empty:T[] =[];
  //if(array.length <= offset)
  //  yield empty;
  //else{
  while(array.length> offset)
  {
    const iterator = subsets<T>(array,offset+1)
    let subs = iterator.next();
    while(subs.done != undefined && !subs.done){
      subs.value.push(array[offset]);
      yield subs.value;
      subs = iterator.next();
    }
    offset+=1;
  }
  yield empty;
}

function buildSearchOptions(options:SearchOption[]): SearchOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchOptions: any = {};
  for (const opt of options){
    for (const param of opt.parameters){
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      searchOptions[param.key] = param.value;
    }
  }
  return new SearchOptions(searchOptions);
}
