import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AskAiDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question!: string;
}