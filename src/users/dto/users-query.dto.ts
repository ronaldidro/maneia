import { QueryDto } from '@/common/dto/query.dto';
import { Role } from '@/common/enum/role.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UsersQueryDto extends QueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
