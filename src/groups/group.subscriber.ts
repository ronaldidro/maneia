import { ConfigService } from '@nestjs/config';
import Cryptr from 'cryptr';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Group } from '@/groups/entities/group.entity';

@EventSubscriber()
export class GroupSubscriber implements EntitySubscriberInterface<Group> {
  private cryptr: Cryptr;

  constructor(
    dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    dataSource.subscribers.push(this);

    const encryptionKey =
      this.configService.getOrThrow<string>('encryption_key');

    this.cryptr = new Cryptr(encryptionKey);
  }

  listenTo() {
    return Group;
  }

  beforeInsert(event: InsertEvent<Group>) {
    const group = event.entity;

    if (group.discordWebhook)
      group.discordWebhook = this.cryptr.encrypt(group.discordWebhook);
  }

  beforeUpdate(event: UpdateEvent<Group>) {
    const group = event.entity;

    if (group?.discordWebhook)
      group.discordWebhook = this.cryptr.encrypt(
        group.discordWebhook as string,
      );
  }

  afterLoad(entity: Group) {
    if (entity.discordWebhook)
      entity.discordWebhook = this.cryptr.decrypt(entity.discordWebhook);
  }
}
