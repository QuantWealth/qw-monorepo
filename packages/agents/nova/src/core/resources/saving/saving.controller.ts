import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { SavingService } from './saving.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { SavingApyQueryDto } from './dto/saving-apy-query.dto';

@Controller('saving')
export class SavingController {
  constructor(private readonly savingService: SavingService) {}

  /**
   * Get route to request all types of savings
   * @returns savings array
   */
  @HttpCode(HttpStatus.OK)
  @Get('all')
  getAllSavings(@Query() savingApyQueryDto: SavingApyQueryDto) {
    const data = this.savingService.getAllSavings(savingApyQueryDto);

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
