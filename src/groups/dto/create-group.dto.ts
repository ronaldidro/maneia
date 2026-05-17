import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  members: string[];
}
