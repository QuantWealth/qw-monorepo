import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SavingService } from './saving.service';

@Controller('saving')
export class SavingController {
  constructor(private readonly savingService: SavingService) {}

  @HttpCode(HttpStatus.OK)
  @Get('all')
  getAllSavings() {
    const data = this.savingService.getAllSavings();

    return {
      statusCode: HttpStatus.OK,
      message: 'Retrieved all savings successfully',
      data,
    };
  }
}
