import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, ValidateNested } from 'class-validator';
import { SubmitModuleAnswerDto } from './submit-module-answer.dto';

export class SubmitModuleDto {
  @IsInt()
  userId: number | undefined;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitModuleAnswerDto)
  answers: SubmitModuleAnswerDto[] | undefined;
}