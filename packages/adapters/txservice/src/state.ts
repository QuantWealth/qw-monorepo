/**
 * Enum for the state of a transaction.
 */
export enum TransactionState {
  Pending = "Pending",      // Transaction needs to be submitted.
  Submitted = "Submitted",  // Transaction was submitted to RPCs but has 0 confirmations.
  Mined = "Mined",          // Transaction was 'mined' on-chain meaning that it has >0 confirmations.
  Confirmed = "Confirmed",  // Transaction"s confirmations >= configured confirmationsRequired.
  Failed = "Failed",        // Transaction failed to send to RPCs, meaning it did not show up on-chain.
  Reverted = "Reverted",    // Transaction sent but failed on-chain.
}
