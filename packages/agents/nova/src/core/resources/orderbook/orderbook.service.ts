import { Injectable } from '@nestjs/common';
import { DefiApyQueryDto } from './dto/approve.dto';
import { DefiApyResponse } from './dto/execute.dto';
import { ethers } from 'ethers';

@Injectable()
export class OrderbookService {
  /**
   * This service is called by /defi/apy endpoint
   * It retrieves the apy of the asset address provided
   * This only fetches apy from aave
   * @returns apy string
   */
  
  // call approve at utils to get the transaction request
  // add the order details to orderbook-db and call executeRelayTransaction to relay the approve.


  // Wrap the below
  // create batch transactions for pending orders, pull the data from orderbook DB and create receiveFuns batch transactions, return transactions[]
  // create execute transaction for pending orders, pull the data from orderbook DB and create execute transactions, return transactions[]
  // sign the above batch transcations by signSafeTransaction and then executeRelayTransaction to relay the batch transactions.
}
