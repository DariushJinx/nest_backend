import { ContactEntity } from '../contact.entity';

export type contactType = Omit<ContactEntity, 'updateTimeStamp'>;
