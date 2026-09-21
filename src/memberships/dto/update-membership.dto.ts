import { IsNumber, Min, ValidateIf } from 'class-validator';

export class UpdateMembershipDto {
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  budget: number | null;
}
