import { UserEntity } from '../user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'off' })
export class OffEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  percent: number;

  @Column()
  max: number;

  @Column()
  uses: number;

  @ManyToOne(() => UserEntity, (user) => user.offs, { eager: true })
  creator: UserEntity;

  @Column({ nullable: true })
  course_id: number;

  @Column({ nullable: true })
  product_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
