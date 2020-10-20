import { Geometry } from 'geojson';
import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity()
export class ImageData {
  @PrimaryColumn('uuid')
  public id: string;

  @Column()
  public imageLocation: string;

  @Column()
  @Index()
  public imagingTime: Date;

  @Column('text')
  public additionalData: string;

  @Column('geometry', {
    spatialFeatureType: 'Geometry',
    srid: 4326,
  })
  @Index({ spatial: true })
  public footprint: Geometry;

  public constructor(init?: Partial<ImageData>) {
    Object.assign(this, init);
  }
}
