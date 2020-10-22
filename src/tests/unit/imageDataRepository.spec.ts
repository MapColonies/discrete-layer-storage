//this import must be called before the first import of tsyring
import 'reflect-metadata';
import { container } from 'tsyringe';
import { MCLogger } from '@map-colonies/mc-logger';
import { ImageDataRepository } from '../../DAL/ImageDataRepository';
import { ImageData } from '../../entity/ImageData';
import { OrderField, SearchOptions } from '../../models/searchOptions';
import { ConflictError } from '../../exceptions/ConflictError';
import { NotFoundError } from '../../exceptions/NotFoundError';
interface SearchOption {
  query: string;
  parameters: [
    {
      key: string;
      value: unknown;
    }
  ];
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
    }).rejects.toThrow(ConflictError);
  });

  it('create should not throw if value dont exist', async () => {
    (imagesRepo.findOne as jest.Mock).mockResolvedValue(undefined);
    //test
    await expect(imagesRepo.createAndSave(data)).resolves.not.toThrow();
  });

  it('update should throw if value dont exist', async () => {
    (imagesRepo.findOne as jest.Mock).mockResolvedValue(undefined);
    //test
    await expect(imagesRepo.updateImageDate(data)).rejects.toThrow(
      NotFoundError
    );
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
    await expect(imagesRepo.deleteImageData('')).rejects.toThrow(NotFoundError);
  });

  it('search should use all given conditions', async () => {
    //generate mocks
    const queryBuilder = buildQueryBuilderMock();
    const getQueryBuilder = jest.fn();
    getQueryBuilder.mockReturnValue(queryBuilder);
    imagesRepo.createQueryBuilder = getQueryBuilder;
    //search options
    const footprintOption: SearchOption = {
      query:
        'ST_Intersects(image.footprint, ST_SetSRID(ST_GeomFromGeoJSON(:geometry),4326))',
      parameters: [
        {
          key: 'geometry',
          value: {
            type: 'Point',
            coordinates: [100.5, 0.5],
          },
        },
      ],
    };
    const startDateOption: SearchOption = {
      query: 'image.imagingTime >= :startDate',
      parameters: [
        {
          key: 'startDate',
          value: new Date(2020, 1, 1, 1, 1, 1),
        },
      ],
    };
    const endDateOption: SearchOption = {
      query: 'image.imagingTime <= :endDate',
      parameters: [
        {
          key: 'endDate',
          value: new Date(2020, 1, 1, 1, 1, 1),
        },
      ],
    };

    const optionsList = [footprintOption, startDateOption, endDateOption];

    //loop on all search condition combinations
    const iterator = subsets<SearchOption>(optionsList);
    let options = iterator.next();
    while (options.done != undefined && !options.done) {
      //clear mocks
      clearQueryBuilderMock(queryBuilder);
      getQueryBuilder.mockClear();
      //test
      const searchOptions = buildSearchOptions(options.value);
      await imagesRepo.search(searchOptions);
      expect(getQueryBuilder).toHaveBeenCalledTimes(1);
      if (options.value.length > 0) {
        expect(queryBuilder.where).toHaveBeenCalledTimes(1);
        expect(queryBuilder.andWhere).toHaveBeenCalledTimes(
          options.value.length - 1
        );
      } else {
        expect(queryBuilder.where).not.toHaveBeenCalled();
        expect(queryBuilder.andWhere).not.toHaveBeenCalled();
      }
      let paramCount = 0;
      for (const opt of options.value) {
        expectOr(
          () => expect(queryBuilder.where).toHaveBeenCalledWith(opt.query),
          () => expect(queryBuilder.andWhere).toHaveBeenCalledWith(opt.query)
        );
        paramCount += opt.parameters.length;
        for (const param of opt.parameters) {
          expect(queryBuilder.setParameter).toHaveBeenCalledWith(
            param.key,
            param.value
          );
        }
      }
      expect(queryBuilder.setParameter).toHaveBeenCalledTimes(paramCount);
      expect(queryBuilder.orderBy).toHaveBeenCalledTimes(1);
      expect(queryBuilder.getMany).toHaveBeenCalledTimes(1);

      options = iterator.next();
    }
  });

  it('search offset and page size should be added to search query', async () => {
    //generate mocks
    const queryBuilder = buildQueryBuilderMock();
    const getQueryBuilder = jest.fn();
    getQueryBuilder.mockReturnValue(queryBuilder);
    imagesRepo.createQueryBuilder = getQueryBuilder;
    //test data
    const searchOptions = new SearchOptions({
      pageSize: 15,
      offset: 38,
    });
    //test
    await imagesRepo.search(searchOptions);
    expect(queryBuilder.offset).toHaveBeenCalledWith(searchOptions.offset);
    expect(queryBuilder.offset).toHaveBeenCalledTimes(1);
    expect(queryBuilder.limit).toHaveBeenCalledWith(searchOptions.pageSize);
    expect(queryBuilder.limit).toHaveBeenCalledTimes(1);
  });

  it('search ascending sort should be added to search query', async () => {
    //generate mocks
    const queryBuilder = buildQueryBuilderMock();
    const getQueryBuilder = jest.fn();
    getQueryBuilder.mockReturnValue(queryBuilder);
    imagesRepo.createQueryBuilder = getQueryBuilder;
    //test data
    const searchOptions = new SearchOptions({
      sort: {
        desc: false,
        orderBy: OrderField.IMAGING_TIME,
      },
    });
    //test
    await imagesRepo.search(searchOptions);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith(
      `image.${OrderField.IMAGING_TIME.toString()}`,
      'ASC'
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledTimes(1);
  });

  it('search descending sort should be added to search query', async () => {
    //generate mocks
    const queryBuilder = buildQueryBuilderMock();
    const getQueryBuilder = jest.fn();
    getQueryBuilder.mockReturnValue(queryBuilder);
    imagesRepo.createQueryBuilder = getQueryBuilder;
    //test data
    const searchOptions = new SearchOptions({
      sort: {
        desc: true,
        orderBy: OrderField.IMAGING_TIME,
      },
    });
    //test
    await imagesRepo.search(searchOptions);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith(
      `image.${OrderField.IMAGING_TIME.toString()}`,
      'DESC'
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledTimes(1);
  });
});

interface QueryBuilderMock {
  where: jest.Mock;
  andWhere: jest.Mock;
  setParameter: jest.Mock;
  getMany: jest.Mock;
  orderBy: jest.Mock;
  limit: jest.Mock;
  offset: jest.Mock;
}

function buildQueryBuilderMock(): QueryBuilderMock {
  const queryBuilder = {
    where: jest.fn(),
    andWhere: jest.fn(),
    setParameter: jest.fn(),
    getMany: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    offset: jest.fn(),
  };
  queryBuilder.where.mockReturnValue(queryBuilder);
  queryBuilder.andWhere.mockReturnValue(queryBuilder);
  queryBuilder.setParameter.mockReturnValue(queryBuilder);
  queryBuilder.orderBy.mockReturnValue(queryBuilder);
  queryBuilder.limit.mockReturnValue(queryBuilder);
  queryBuilder.offset.mockReturnValue(queryBuilder);
  return queryBuilder;
}

function clearQueryBuilderMock(queryBuilder: QueryBuilderMock) {
  queryBuilder.setParameter.mockClear();
  queryBuilder.where.mockClear();
  queryBuilder.andWhere.mockClear();
  queryBuilder.getMany.mockClear();
  queryBuilder.orderBy.mockClear();
  queryBuilder.limit.mockClear();
  queryBuilder.offset.mockClear();
}

// Generate all array subsets:
function* subsets<T>(array: T[], offset = 0): IterableIterator<T[]> {
  const empty: T[] = [];
  while (array.length > offset) {
    const iterator = subsets<T>(array, offset + 1);
    let subs = iterator.next();
    while (subs.done != undefined && !subs.done) {
      subs.value.push(array[offset]);
      yield subs.value;
      subs = iterator.next();
    }
    offset += 1;
  }
  yield empty;
}

function buildSearchOptions(options: SearchOption[]): SearchOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchOptions: any = {};
  for (const opt of options) {
    for (const param of opt.parameters) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      searchOptions[param.key] = param.value;
    }
  }
  return new SearchOptions(searchOptions);
}

function expectOr(...tests: (() => void)[]) {
  try {
    const expectCondition = tests.shift();
    if (expectCondition != undefined) {
      expectCondition();
    } else {
      throw new Error('invalid test condition');
    }
  } catch (e) {
    if (tests.length) expectOr(...tests);
    else throw e;
  }
}
