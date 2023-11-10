import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'episode' })
export class EpisodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  text: string;

  @Column({ default: 'unlock' })
  type: string;

  @Column()
  time: string;

  @Column()
  videoAddress: string;

  @Column()
  user_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
