import { Geometry } from "geojson";


export class SearchOptions{

    public footprint?: Geometry;

    


    public constructor(init?: Partial<SearchOptions>) {
        Object.assign(this, init);
      }
}