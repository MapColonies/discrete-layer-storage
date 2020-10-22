import { createConnection, Connection, ObjectType } from 'typeorm';
import config from 'config';
import { delay, inject, injectable } from 'tsyringe';
import { MCLogger } from '@map-colonies/mc-logger';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { ImageDataRepository } from './imageDataRepository';

@injectable()
export class ConnectionManager {
  private connection?: Connection;

  public constructor(
    @inject(delay(() => MCLogger)) private readonly logger: MCLogger
  ) {}

  public async init(): Promise<void> {
    const connectionConfig = config.get<PostgresConnectionOptions>('typeOrm');
    this.logger.info(
      `connection to database ${connectionConfig.database as string} on ${
        connectionConfig.host as string
      }`
    );
    try {
      this.connection = await createConnection(connectionConfig);
    } catch (err) {
      const errString = JSON.stringify(err);
      this.logger.error(`failed to connect to database: ${errString}`);
      throw err;
    }
  }

  public isConnected(): boolean {
    return this.connection !== undefined;
  }

  public getImageDataRepository(): ImageDataRepository {
    return this.getRepository(ImageDataRepository);
  }

  private getRepository<T>(repository: ObjectType<T>): T {
    if (!this.isConnected()) {
      const msg = 'failed to send request to database: no open connection';
      this.logger.error(msg);
      throw new Error(msg);
    } else {
      const connection = this.connection as Connection;
      return connection.getCustomRepository(repository);
    }
  }
}
