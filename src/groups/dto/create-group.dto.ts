import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  members: string[];

  @ValidateIf((_, value) => value !== '')
  @IsString()
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @Matches(/^https:\/\/discord\.com\/api\/webhooks\//)
  discordWebhook?: string;
}
