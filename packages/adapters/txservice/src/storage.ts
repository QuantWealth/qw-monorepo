import { Transaction } from './transactionTypes'; // Assuming we have a file defining transaction types.
import { TransactionState } from './state';

/**
 * Class to store active transactions locally.
 * This will eventually be replaced with a database for persistent storage.
 */
export class TransactionStorage {
  private activeTransactions: Transaction[] = [];

  /**
   * Adds a transaction to the active queue.
   * @param transaction - The transaction to add.
   */
  add(transaction: Transaction): void {
    this.activeTransactions.push(transaction);
    this.activeTransactions.sort((a, b) => a.nonce - b.nonce); // Ensure transactions are ordered by nonce.
  }

  /**
   * Removes a transaction from the active queue.
   * @param transaction - The transaction to remove.
   */
  remove(transaction: Transaction): void {
    this.activeTransactions = this.activeTransactions.filter(tx => tx.hash !== transaction.hash);
  }

  /**
   * Retrieves a transaction by its hash.
   * @param transactionHash - The hash of the transaction to retrieve.
   * @returns The transaction with the specified hash, or undefined if not found.
   */
  get(transactionHash: string): Transaction | undefined {
    return this.activeTransactions.find(tx => tx.hash === transactionHash);
  }

  /**
   * Prunes transactions that are in a failed or confirmed state.
   */
  prune(): void {
    this.activeTransactions = this.activeTransactions.filter(tx => tx.state !== TransactionState.Failed && tx.state !== TransactionState.Confirmed);
  }
}
