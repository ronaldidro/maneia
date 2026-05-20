import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '@/base/pagination.dto';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export abstract class BasePaginate<T extends ObjectLiteral> {
  protected async paginate(
    builder: SelectQueryBuilder<T>,
    query: PaginationDto,
  ): Promise<PaginatedResponse<T>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await builder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }
}
