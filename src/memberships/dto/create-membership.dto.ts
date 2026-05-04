import { ArrayNotEmpty, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMembershipDto {
  @IsNotEmpty()
  @IsUUID()
  group: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  users: string[];
}
