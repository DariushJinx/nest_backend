import { CategoryType } from './category.types';

export interface CategoriesResponseInterface {
  allCategories: CategoryType[];
  categoriesCount: number;
}
