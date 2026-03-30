import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { AskAiDto } from './dto/ask-ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  askQuestion(@Body() dto: AskAiDto) {
    return this.aiService.askQuestion(dto);
  }
}