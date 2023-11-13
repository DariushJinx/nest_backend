import { OffEntity } from '../off.entity';

export type offType = Omit<OffEntity, 'updateTimeStamp'>;
