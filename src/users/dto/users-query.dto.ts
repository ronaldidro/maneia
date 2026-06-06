import { PaginationDto } from '@/base/pagination.dto';
import { Role } from '@/common/enum/role.enum';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UsersQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
