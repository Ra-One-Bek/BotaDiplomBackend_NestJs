import { IsInt } from 'class-validator';

export class SubmitModuleAnswerDto {
  @IsInt()
  questionId: number | undefined;

  @IsInt()
  answerOptionId: number | undefined;
}