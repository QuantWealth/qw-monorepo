import { ethers, providers } from 'ethers';
import { TransactionServiceConfig, validateConfig } from './config';
import { TransactionStorage } from './storage';
import { TransactionServiceError, RpcFailure, InvalidTransaction } from './error';
import { TransactionState } from './state';
import { WriteTransaction, ReadTransaction } from './transaction';

interface TxDetails {
  chainId: number;
  to: string;
  value: string;
  data: string;
}

class TransactionService {
  private config: TransactionServiceConfig;
  private signer: ethers.Signer;
  private storage: TransactionStorage;

  constructor(config: TransactionServiceConfig, signer: ethers.Signer) {
    validateConfig(config);
    this.config = config;
    this.signer = signer;
    this.storage = new TransactionStorage();
  }

  async read(txDetails: TxDetails, callback: (tx: ReadTransaction) => void, previousTransaction?: ReadTransaction) {
    const transaction = await this.dispatch(txDetails, false, previousTransaction);
    this.spawnMonitorThread(transaction, callback, this.read.bind(this, txDetails, callback));
    return { ...transaction }; // Return a copy of the transaction object
  }

  async write(txDetails: TxDetails, callback: (tx: WriteTransaction) => void, previousTransaction?: WriteTransaction) {
    const transaction = await this.dispatch(txDetails, true, previousTransaction);
    this.spawnMonitorThread(transaction, callback, this.write.bind(this, txDetails, callback));
    return { ...transaction }; // Return a copy of the transaction object
  }

  async send(txDetails: TxDetails, callback: (tx: WriteTransaction) => void, previousTransaction?: WriteTransaction) {
    const transaction = await this.dispatch(txDetails, true, previousTransaction);
    this.spawnMonitorThread(transaction, callback, this.send.bind(this, txDetails, callback));
    return { ...transaction }; // Return a copy of the transaction object
  }

  private async dispatch(txDetails: TxDetails, isWrite: boolean, previousTransaction?: WriteTransaction | ReadTransaction) {
    const { chainId } = txDetails;
    const config = this.config[chainId];
    const providers = this.getRandomProviders(config.providers, config.targetProvidersPerCall);

    let transaction: WriteTransaction | ReadTransaction = {
      nonce: previousTransaction ? previousTransaction.nonce : await this.signer.getTransactionCount('pending'),
      gasLimit: ethers.utils.parseUnits(txDetails.value, 'wei').toString(),
      state: TransactionState.Submitted,
      ...(isWrite && previousTransaction ? { gasPrice: this.bumpGasPrice((previousTransaction as WriteTransaction).gasPrice!, config.gasPriceBump) } : {})
    };

    let error: any;

    for (let providerUrl of providers) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        const gasPrice = previousTransaction ? (transaction as WriteTransaction).gasPrice : await this.getGasPrice(provider, config);

        if (isWrite) {
          transaction = {
            ...transaction,
            gasPrice,
            nonce: transaction.nonce ?? await this.signer.getTransactionCount('pending'),
          } as WriteTransaction;

          const response = await this.signer.sendTransaction(transaction as WriteTransaction);
          transaction.hash = response.hash;
          this.storage.add(transaction as WriteTransaction);
          return transaction;
        } else {
          const callTransaction = {
            ...transaction,
            gasPrice,
          };

          const response = await provider.call(callTransaction, 'latest');
          this.storage.add(transaction as WriteTransaction);
          return transaction;
        }
      } catch (err) {
        if (err.code === 'NETWORK_ERROR' || err.code === 'SERVER_ERROR') {
          error = new RpcFailure('RPC Failure', { providerUrl, error: err });
        } else {
          error = new InvalidTransaction('Invalid Transaction', { error: err });
        }
      }
    }

    throw new TransactionServiceError('Failed to dispatch transaction', { ...transaction, error });
  }

  private async monitor(transaction: WriteTransaction | ReadTransaction, callback: (tx: any | TransactionServiceError) => void, originalMethod: (previousTransaction?: any) => void) {
    const { chainId } = transaction;
    const config = this.config[chainId];
    const provider = new ethers.providers.JsonRpcProvider(config.providers[0]); // Use the first provider for monitoring

    let confirmations = 0;
    let retries = 0;

    while (confirmations < config.confirmationsRequired && retries < (config.maxRetries || 5)) {
      try {
        const receipt = await provider.getTransactionReceipt((transaction as WriteTransaction).hash!);
        if (receipt) {
          transaction.confirmations = receipt.confirmations;
          if (transaction.confirmations >= config.confirmationsRequired) {
            transaction.state = TransactionState.Confirmed;
            this.storage.remove(transaction as WriteTransaction);
            callback(transaction);
            return;
          } else if (receipt.status === 0) {
            transaction.state = TransactionState.Reverted;
            this.storage.remove(transaction as WriteTransaction);
            callback(transaction);
            return;
          } else if (receipt.blockNumber && !(transaction as WriteTransaction).hash) {
            (transaction as WriteTransaction).hash = receipt.transactionHash; // Assign the hash once mined
          }
        }

        confirmations = receipt ? receipt.confirmations : 0;
      } catch (error) {
        retries++;
        if (retries >= (config.maxRetries || 5)) {
          transaction.state = TransactionState.Failed;
          this.storage.remove(transaction as WriteTransaction);
          callback(new RpcFailure('RPC Failure after retries', { error, transaction }));
          return;
        }
      }
      await this.sleep(config.timeout);
    }

    if (parseFloat((transaction as WriteTransaction).gasPrice!) >= parseFloat(config.gasPriceMax)) {
      await this.fillNonceGap(chainId, transaction.nonce);
      callback(new InvalidTransaction('Gas price hit maximum, transaction failed', { transaction }));
      return;
    }

    if (transaction.state === TransactionState.Failed) {
      await originalMethod(transaction); // Retry with bumped gas
    }
  }

  private getRandomProviders(providers: string[], count: number): string[] {
    const shuffled = providers.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private async getGasPrice(provider: providers.JsonRpcProvider, config: any) {
    let gasPrice = await provider.getGasPrice();
    if (gasPrice.gt(ethers.utils.parseUnits(config.gasPriceMax, 'wei'))) {
      gasPrice = ethers.utils.parseUnits(config.gasPriceMax, 'wei');
    } else if (gasPrice.lt(ethers.utils.parseUnits(config.gasPriceMin, 'wei'))) {
      gasPrice = ethers.utils.parseUnits(config.gasPriceMin, 'wei');
    }
    return gasPrice.toString();
  }

  private bumpGasPrice(currentGasPrice: string, bumpPercentage: string) {
    const bumpFactor = parseFloat(bumpPercentage);
    if (bumpFactor < 0.05 || bumpFactor > 1.0) {
      throw new Error('Gas price bump percentage must be between 0.05 and 1.0');
    }
    const currentGasPriceBN = ethers.BigNumber.from(currentGasPrice);
    const bumpAmount = currentGasPriceBN.mul(ethers.BigNumber.from(Math.floor(bumpFactor * 100).toString())).div(ethers.BigNumber.from('100'));
    const newGasPrice = currentGasPriceBN.add(bumpAmount);
    return newGasPrice.toString();
  }

  private async fillNonceGap(chainId: number, targetNonce: number) {
    const address = await this.signer.getAddress();
    const txDetails: TxDetails = {
      chainId: chainId,
      to: address,
      value: '0',
      data: '0x'
    };
    await this.send(txDetails, () => {}, { nonce: targetNonce });
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private spawnMonitorThread(transaction: any, callback: (tx: any | TransactionServiceError) => void, originalMethod: (previousTransaction?: any) => void) {
    // TODO: Implement deep copy of the transaction object.
    setTimeout(() => this.monitor(transaction, callback, originalMethod), 0);
  }
}

export { TransactionService };
