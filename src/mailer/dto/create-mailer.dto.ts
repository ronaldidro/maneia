import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMailerDto {
  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}
