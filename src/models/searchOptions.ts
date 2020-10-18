import { Geometry } from "geojson";

export enum OrderFiled {
  DATE = "date"
}

export class SearchOptions{

    public geometry?: Geometry;
    public startDate?: Date;
    public endDate?: Date;

    public sort?:{
      desc: boolean,
      orderBy: OrderFiled
    };

    public constructor(init?: Partial<SearchOptions>) {
        Object.assign(this, init);
      }
}
