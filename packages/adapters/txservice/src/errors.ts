/**
 * Abstract class for transaction service errors.
 */
export abstract class TransactionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error class for RPC failures.
 */
export class RpcFailure extends TransactionServiceError {
  providerUrl: string;
  error: any;

  constructor(message: string, details: { providerUrl: string; error: any }) {
    super(message);
    this.providerUrl = details.providerUrl;
    this.error = details.error;
  }
}

/**
 * Error class for invalid transactions.
 */
export class InvalidTransaction extends TransactionServiceError {
  error: any;

  constructor(message: string, details: { error: any }) {
    super(message);
    this.error = details.error;
  }
}
