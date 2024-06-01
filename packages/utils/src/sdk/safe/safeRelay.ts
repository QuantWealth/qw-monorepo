import { GelatoRelayPack } from '@safe-global/relay-kit'
import Safe from '@safe-global/protocol-kit';
import {
    MetaTransactionData,
    MetaTransactionOptions,
    SafeTransaction,
    Transaction
} from '@safe-global/safe-core-sdk-types'


export const createTransactions = async (args: {
    transactions: MetaTransactionData[],
}): Promise<MetaTransactionData[]> => {
    const transactions: MetaTransactionData[] = args.transactions;

    return transactions;
}

export const createGelatoRelayPack = async (args: { gelatoApiKey: string, protocolKit: Safe }): Promise<GelatoRelayPack> => {
    const { gelatoApiKey, protocolKit } = args;
    const relayKit = new GelatoRelayPack({
        apiKey: gelatoApiKey,
        protocolKit // User's safe instance
    })

    return relayKit;
}


export const relayTransaction = async (args: {
    transactions: MetaTransactionData[],
    gelatoRelayPack: GelatoRelayPack
}): Promise<SafeTransaction> => {
    const { transactions, gelatoRelayPack: relayKit } = args;

    const options: MetaTransactionOptions = {
        isSponsored: true
    }
    const safeTransaction = await relayKit.createTransaction({
        transactions,
        options
    })

    return safeTransaction;
}

export const signSafeTransaction = async (args: {
    protocolKit: Safe // Protocol Kit instance of QW with Signer
    safeTransaction: SafeTransaction
}): Promise<SafeTransaction> => {
    const { protocolKit, safeTransaction } = args;

    const signedSafeTransaction = await protocolKit.signTransaction(safeTransaction)

    return signedSafeTransaction;
};


export const executeRelayTransaction = async (args: {
    gelatoRelayPack: GelatoRelayPack,
    signedSafeTransaction: SafeTransaction,
}): Promise<void> => {
    const { gelatoRelayPack: relayKit, signedSafeTransaction } = args;
    const options: MetaTransactionOptions = {
        isSponsored: true
    }
    const response = await relayKit.executeTransaction({
        executable: signedSafeTransaction,
        options
    });

    console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`);
}

export const normalizeMetaTransaction = (args: {
    tx: Transaction
}): MetaTransactionData => {
    const  { tx } = args;
    return {
        to: tx.to,
        value: tx.value.toString(),
        data: tx.data,
    };
}
