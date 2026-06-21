import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  current: string;

  @IsNotEmpty()
  @IsString()
  renewed: string;
}
