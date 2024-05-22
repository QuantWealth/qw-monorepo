/**
 * Custom error class for transaction errors.
 * Contains a partially populated transaction object for context.
 */
export class TransactionError extends Error {
  transaction: any;

  /**
   * Constructs a new TransactionError.
   * @param message - The error message.
   * @param transaction - The partially populated transaction object.
   */
  constructor(message: string, transaction: any) {
      super(message);
      this.transaction = transaction;
      this.name = 'TransactionError';
  }
}
  