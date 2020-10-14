import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class ImageData {
  @PrimaryColumn('uuid')
  public id: string;

  @Column()
  public imageLocation: string;

  @Column()
  public date: Date;

  @Column('text')
  public additionalData: string;

  public constructor(init?: Partial<ImageData>) {
    Object.assign(this, init);
  }
}
