import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'categories' })
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('simple-array')
  images: string[];

  @OneToOne(() => CategoryEntity, (category) => category.id)
  parent: CategoryEntity;
}
