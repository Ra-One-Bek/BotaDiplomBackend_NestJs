import { IsInt } from 'class-validator';

export class SubmitAnswerItemDto {
  @IsInt()
  questionId: number;

  @IsInt()
  answerOptionId: number;
}