//this import must be called before the first import of tsyring
import 'reflect-metadata';
import { container } from 'tsyringe';
import { MCLogger } from '@map-colonies/mc-logger';
import { ImageDataRepository } from '../../DAL/ImageDataRepository';
import { ImageData } from '../../entity/ImageData';

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
});
