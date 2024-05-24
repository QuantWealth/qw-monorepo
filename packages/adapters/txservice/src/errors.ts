export abstract class TransactionServiceError extends Error {
  IS_RPC_ERR: boolean = false;
  transaction?: any;

  constructor(message: string, transaction?: any) {
    super(message);
    this.name = this.constructor.name;
    this.transaction = transaction;
  }
}

export class RpcFailure extends TransactionServiceError {
  providerUrls: string[];
  error: any;

  constructor(message: string, details: { provider?: string, providerUrls: string[]; error?: any; transaction?: any }) {
    super(message, details.transaction);
    this.providerUrls = details.providerUrls;
    this.error = details.error;
  }
}

export class InvalidTransaction extends TransactionServiceError {
  error: any;

  constructor(message: string, details: { error?: any; transaction?: any }) {
    super(message, details.transaction);
    this.error = details.error;
  }
}

export class DispatchFailure extends TransactionServiceError {
  IS_RPC_ERR: boolean = true;
  errors: any[];

  constructor(details: { errors: any[]; transaction: any }) {
    super("Failed to dispatch transaction due to error(s):", details.transaction);
    this.errors = details.errors;
  }
}
