import { contactType } from './contact.type';

export interface ContactsResponseInterface {
  contacts: contactType[];
  contactsCount: number;
}
