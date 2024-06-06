import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TSaving } from 'src/common/types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QuerySavingAllDto } from './dto/saving-all-response.dto';
import { SavingApyQueryDto } from './dto/saving-apy-query.dto';
import { SavingService } from './saving.service';

@ApiTags('saving')
@Controller('saving')
export class SavingController {
  constructor(private readonly savingService: SavingService) {}

  /**
   * Get route to request all types of savings
   * @returns savings array
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All savings strategies',
    type: QuerySavingAllDto,
  })
  @Get('all')
  getAllSavings(
    @Query() savingApyQueryDto: SavingApyQueryDto,
  ): Promise<Array<TSaving>> {
    return this.savingService.getAllSavings(savingApyQueryDto);
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
