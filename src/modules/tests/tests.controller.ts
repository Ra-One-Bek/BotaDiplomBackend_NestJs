import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TestsService } from './tests.service';
import { SubmitTestDto } from './dto/submit-test.dto';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get('questions')
  getQuestions() {
    return this.testsService.getQuestions();
  }

  @Post('submit')
  submitTest(@Body() dto: SubmitTestDto) {
    return this.testsService.submitTest(dto);
  }

  @Get('result/:userId')
  getResult(@Param('userId', ParseIntPipe) userId: number) {
    return this.testsService.getResult(userId);
  }
}