import { Geometry } from 'geojson';

export enum OrderField {
  IMAGING_TIME = 'imagingTime',
}

export class SearchOptions {
  public geometry?: Geometry;
  public startDate?: Date;
  public endDate?: Date;

  public offset?: number;
  public pageSize?: number;

  public sort?: {
    desc: boolean;
    orderBy: OrderField;
  };

  public constructor(init?: Partial<SearchOptions>) {
    Object.assign(this, init);
  }
}
