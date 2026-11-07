import type groups from '@/translation/es/groups.json';
import type expenses from '@/translation/es/expenses.json';
import type validation from '@/translation/es/validation.json';

export interface Translations {
  groups: typeof groups;
  expenses: typeof expenses;
  validation: typeof validation;
}

declare module '@nestjs/i18n' {
  interface I18nTypes {
    translations: Translations;
  }
}
