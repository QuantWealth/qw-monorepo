import { ethers, providers } from "ethers";
import { TransactionServiceConfig, validateConfig } from "./config";
import { TransactionStorage } from "./storage";
import { TransactionServiceError, RpcFailure, InvalidTransaction, DispatchFailure } from "./errors";
import { TransactionState } from "./state";
import { Transaction } from "./transaction";

interface ReadTxDetails {
  chainId: number;
  to: string;
  data: string;
}

interface WriteTxDetails extends ReadTxDetails {
  value: string;
}

class TransactionService {
  private config: TransactionServiceConfig;
  private signer: ethers.Signer;
  private storage: TransactionStorage;

  /**
   * Initializes the TransactionService.
   * @param config - The transaction service configuration (consult schema, see: config.ts).
   * @param signer - The signer to use for transactions.
   */
  constructor(config: TransactionServiceConfig, signer: ethers.Signer) {
    validateConfig(config);
    this.config = config;
    this.signer = signer;
    this.storage = new TransactionStorage();
  }

  /**
   * Performs a read transaction.
   * @param txDetails - The transaction details.
   * @returns A promise that resolves to the response of the read transaction.
   */
  async read(txDetails: ReadTxDetails): Promise<any> {
    const { chainId } = txDetails;
    const config = this.config[chainId];
    const providers = this.getRandomProviders(config.providers, config.targetProvidersPerCall);

    let response: any;
    let error: any;

    for (let providerUrl of providers) {
      try {
        const provider = this.makeProvider(providerUrl);
        response = await provider.call({
          to: txDetails.to,
          data: txDetails.data,
        });
        return response;
      } catch (err) {
        if (err.code === "NETWORK_ERROR" || err.code === "SERVER_ERROR") {
          error = new RpcFailure("RPC Failure", { providerUrls: [providerUrl], error: err });
        } else {
          error = new InvalidTransaction("Invalid Transaction", { error: err });
        }
      }
    }

    throw new InvalidTransaction("Failed to dispatch read transaction.", { error });
  }

  /**
   * Performs a write transaction.
   * @param txDetails - The transaction details.
   * @param previousTransaction - The previous transaction details, if any.
   * TODO: missing nonce arg
   * @returns A copy of the transaction object.
   */
  async write(txDetails: WriteTxDetails, targetNonce?: number): Promise<Transaction | TransactionServiceError> {
    const { chainId } = txDetails;
    const config = this.config[chainId];
    const providers = this.getRandomProviders(config.providers, config.targetProvidersPerCall);

    console.debug("Dispatching transaction:", txDetails, "using providers:", providers);

    let transaction: Transaction = {
      chainId,
      to: txDetails.to,
      data: txDetails.data,
      value: txDetails.value,
      // nonce: await this.signer.getTransactionCount("pending"),
      gasLimit: ethers.utils.parseUnits(txDetails.value, "wei").toString(),
      state: TransactionState.Submitted,
    };
    if (targetNonce) {
      transaction.nonce = targetNonce;
    }

    let errors: TransactionServiceError[] = [];
    let providerIndex: number = 0;

    // NOTE: We use a while loop instead of a for loop here since we don't want to iterate if we're getting a timeout.
    while (true) {
      const providerUrl = providers[providerIndex];
      const provider = this.makeProvider(providerUrl);

      // Fetch gas price.
      try {
        // TODO: Would be neat to not make the first provider twice here and under the while(true)...
        transaction.gasPrice = await this.getGasPrice(provider, config);
      } catch (err) {
        throw new RpcFailure(
          "Gas price fetch failed: invalid transaction.",
          { provider: providers[providerIndex], providerUrls: providers, error: err, transaction }
        );
      }

      transaction.nonce = transaction.nonce != undefined ? transaction.nonce : await this.signer.getTransactionCount("pending");

      try {
        this.signer.connect(provider);
        const request: ethers.providers.TransactionRequest = {
          to: transaction.to,
          data: transaction.data,
          value: transaction.value,
        }
        const response = await this.signer.sendTransaction(request);
        transaction.hash = response.hash;
        transaction.response = response;
        this.storage.add(transaction);
        console.debug("Transaction dispatched successfully:", transaction);
        return await this.monitor(provider, transaction);
      } catch (err) {
        console.debug("Error dispatching transaction with provider:", providerUrl, err);

        // TODO: Handle NONCE_EXPIRED error!
        if (err.code === "NETWORK_ERROR" || err.code === "SERVER_ERROR") {
          errors.push(new RpcFailure("RPC Failure", { providerUrls: [providerUrl], error: err, transaction }));
        } else if (err.code === "TIMEOUT") {
          // TODO: Check if there's other cases where gas price is insufficient.
          // We timed out, we should bump gas price and continue to avoid incrementing provider index.
          transaction.gasPrice = this.bumpGasPrice(transaction.gasPrice!, config.gasPriceBump);
          continue;
        } else {
          errors.push(new InvalidTransaction("Invalid transaction.", { error: err, transaction }));
          break;
        }
      }

      providerIndex++;
    }

    // TODO: Use array of errors over each iteration above.
    throw new DispatchFailure({ errors, transaction });
  }

  /**
   * Monitors a transaction in the provider pool and/or on-chain.
   * @param transaction - The transaction to monitor.
   * @param callback - The callback function to execute once the transaction is confirmed.
   * @param originalMethod - The original method to call if the transaction needs to be retried.
   */
  private async monitor(
    provider: ethers.providers.JsonRpcProvider,
    transaction: Transaction,
  ): Promise<Transaction | TransactionServiceError> {
    const { chainId } = transaction;
    const config = this.config[chainId];

    let confirmations = 0;
    let retries = 0;

    while (confirmations < config.confirmationsRequired && retries < (config.maxRetries || 5)) {
      try {
        const receipt = await provider.getTransactionReceipt(transaction.hash!);
        if (receipt) {
          transaction.receipt = receipt;
          transaction.confirmations = receipt.confirmations;
          if (!transaction.confirmations) {
            throw new InvalidTransaction("Transaction receipt did not have confirmations defined.", { transaction });
          }
          if (transaction.confirmations >= config.confirmationsRequired) {
            transaction.state = TransactionState.Confirmed;
            this.storage.remove(transaction);
            return transaction;
          } else if (receipt.status === 0) {
            transaction.state = TransactionState.Reverted;
            this.storage.remove(transaction);
            return transaction;
          } else if (receipt.blockNumber && !transaction.hash) {
            transaction.hash = receipt.transactionHash;
          }
        }

        confirmations = receipt ? receipt.confirmations : 0;
      } catch (error) {
        retries++;
        if (retries >= (config.maxRetries || 5)) {
          transaction.state = TransactionState.Failed;
          this.storage.remove(transaction);
          return new RpcFailure("RPC Failure after retries.", { providerUrls: [config.providers[0]], error, transaction });
        }
      }
      await this.sleep(config.timeout);
    }

    if (parseFloat((transaction.gasPrice!)) >= parseFloat(config.gasPriceMax)) {
      await this.fillNonceGap(chainId, transaction.nonce);
      return new InvalidTransaction("Gas price hit maximum, transaction failed.", { transaction });
    }

    return transaction;
  }

  /**
   * Gets a random subset of providers.
   * @param providers - The list of available providers.
   * @param count - The number of providers to select.
   * @returns A random subset of providers.
   */
  private getRandomProviders(providers: string[], count: number): string[] {
    const shuffled = providers.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Gets the current gas price.
   * @param provider - The provider to use for getting the gas price.
   * @param config - The transaction service configuration.
   * @returns The current gas price as a string.
   */
  private async getGasPrice(provider: providers.JsonRpcProvider, config: any) {
    let gasPrice;
    try {
      gasPrice = await provider.getGasPrice();
      console.log("Fetched gas price:", gasPrice ? gasPrice.toString() : gasPrice);
      const gasPriceMax = ethers.utils.parseUnits(config.gasPriceMax, "wei");
      const gasPriceMin = ethers.utils.parseUnits(config.gasPriceMin, "wei");

      if (gasPrice.gt(gasPriceMax)) {
        gasPrice = gasPriceMax;
      } else if (gasPrice.lt(gasPriceMin)) {
        gasPrice = gasPriceMin;
      }
      return gasPrice.toString();
    } catch (error) {
      console.error("Error fetching gas price:", error);
      throw new InvalidTransaction("Failed to fetch gas price.", { error });
    }
  }

  /**
   * Bumps the gas price by a percentage.
   * @param currentGasPrice - The current gas price.
   * @param bumpPercentage - The bump percentage.
   * @returns The new gas price as a string.
   */
  private bumpGasPrice(currentGasPrice: string, bumpPercentage: string) {
    const bumpFactor = parseFloat(bumpPercentage);
    if (bumpFactor < 0.05 || bumpFactor > 1.0) {
      throw new Error("Gas price bump percentage must be between 0.05 and 1.0");
    }
    const currentGasPriceBN = ethers.BigNumber.from(currentGasPrice);
    const bumpAmount = currentGasPriceBN.mul(ethers.BigNumber.from(Math.floor(bumpFactor * 100).toString())).div(ethers.BigNumber.from("100"));
    const newGasPrice = currentGasPriceBN.add(bumpAmount);
    return newGasPrice.toString();
  }

  /**
   * Fills a nonce gap by creating a pending transaction.
   * @param chainId - The chain ID.
   * @param targetNonce - The target nonce to fill.
   */
  private async fillNonceGap(chainId: number, targetNonce: number) {
    const address = await this.signer.getAddress();
    const txDetails: WriteTxDetails = {
      chainId: chainId,
      to: address,
      value: "0",
      data: "0x"
    };
    await this.write(txDetails, { chainId, nonce: targetNonce, state: TransactionState.Pending });
  }

  /**
   * Sleeps for a specified duration.
   * @param ms - The duration in milliseconds.
   * @returns A promise that resolves after the specified duration.
   */
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates an instance of ethers.providers.JsonRpcProvider.
   * @param providerUrl - The URL of the provider.
   * @returns An instance of ethers.providers.JsonRpcProvider.
   */
  private makeProvider(providerUrl: string): ethers.providers.JsonRpcProvider {
    return new ethers.providers.JsonRpcProvider(providerUrl);
  }
}

export { TransactionService };
