import { IsOptional, IsUUID } from 'class-validator';

export class MembershipsQueryDto {
  @IsOptional()
  @IsUUID()
  group?: string;
}
