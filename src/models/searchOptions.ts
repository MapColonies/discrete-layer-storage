import { Geometry } from 'geojson';

export enum OrderField {
  DATE = 'date',
}

export class SearchOptions {
  public geometry?: Geometry;
  public startDate?: Date;
  public endDate?: Date;

  public sort?: {
    desc: boolean;
    orderBy: OrderField;
  };

  public constructor(init?: Partial<SearchOptions>) {
    Object.assign(this, init);
  }
}
