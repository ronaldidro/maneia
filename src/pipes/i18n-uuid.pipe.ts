import { Injectable, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { t } from '@nestjs/i18n';

@Injectable()
export class I18nUuidPipe extends ParseUUIDPipe {
  constructor() {
    super({
      exceptionFactory: () =>
        new BadRequestException(t('validation.invalidId')),
    });
  }
}
