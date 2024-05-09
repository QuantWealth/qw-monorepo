import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SavingService } from './saving.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('saving')
export class SavingController {
  constructor(private readonly savingService: SavingService) {}

  /**
   * Get route to request all types of savings
   * @returns savings array
   */
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

  /**
   * Creates the encoded transaction for depositing the amount into one of the savings
   * @param {CreateTransactionDto} createTransactionDto - Fields required to create the transaction
   * @returns The encoded function data
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('create/transaction')
  createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    const data = this.savingService.createTransaction(createTransactionDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Transaction created successfully',
      data,
    };
  }
}
