import { DeepPartial, ObjectLiteral, RemoveOptions, Repository } from 'typeorm';

export abstract class BaseService<T extends ObjectLiteral> {
  protected constructor(protected readonly baseRepository: Repository<T>) {}

  createEntity(entity: DeepPartial<T>): T {
    return this.baseRepository.create(entity);
  }

  createEntities(entities: DeepPartial<T>[]): T[] {
    return this.baseRepository.create(entities);
  }

  removeEntities(entities: T[], options?: RemoveOptions): Promise<T[]> {
    return this.baseRepository.remove(entities, options);
  }
}
