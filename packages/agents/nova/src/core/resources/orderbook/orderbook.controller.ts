import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { DefiApyQueryDto } from './dto/approve.dto';
import { DefiApyResponse } from './dto/execute.dto';
import { DefiService } from './orderbook.service';

@Controller('defi')
export class DefiController {
  constructor(private readonly defiService: DefiService) {}

  /**
   * Retrieves the APY of the asset address provided
   * @param {DefiApyQueryDto} query - query params containing asset address
   * @returns DefiApyResponse
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'APY data fetched successfully.',
    type: DefiApyResponse,
  })
  @Get('apy')
  getApy(@Query() query: DefiApyQueryDto): Promise<DefiApyResponse> {
    return this.defiService.getDefiApy(query);
  }
}
