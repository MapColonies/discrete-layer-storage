import { Geometry } from "geojson";


export class SearchOptions{

    public geometry?: Geometry;

    public constructor(init?: Partial<SearchOptions>) {
        Object.assign(this, init);
      }
}
