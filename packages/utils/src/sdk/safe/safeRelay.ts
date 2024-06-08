import { GelatoRelayPack } from '@safe-global/relay-kit'
import Safe, { EthSafeSignature, SigningMethod } from '@safe-global/protocol-kit';
import {
    EIP712TypedDataMessage,
    EIP712TypedDataTx,
    MetaTransactionData,
    MetaTransactionOptions,
    OperationType,
    SafeEIP712Args,
    SafeTransaction,
    SafeTransactionData,
    Transaction
} from '@safe-global/safe-core-sdk-types'
import EthSafeTransaction from '@safe-global/protocol-kit/dist/src/utils/transactions/SafeTransaction';
import { EIP712_DOMAIN, adjustVInSignature, generateTypedData } from '@safe-global/protocol-kit/dist/src/utils';
import { ethers, TypedDataDomain } from 'ethers';


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

export const getSafeTxTypedData = async (args: {
    protocolKit: Safe, // Protocol Kit instance of QW with Signer
    txData: Transaction,
}): Promise<{
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    primaryType: string,
    message: Record<string, any>
}> => {
    const ksafeAddress = await args.protocolKit.getAddress();
    const ksafeVersion = await args.protocolKit.getContractVersion();
    const kchainId = await args.protocolKit.getChainId();
    console.log(ksafeAddress, ksafeVersion, kchainId);

    const safeEIP712Args: SafeEIP712Args = {
        safeAddress: await args.protocolKit.getAddress(),
        safeVersion: await args.protocolKit.getContractVersion(),
        chainId: await args.protocolKit.getChainId(),
        data: {
            to: args.txData.to,
            value: args.txData.value,
            data: args.txData.data,
            operation: OperationType.Call,
            safeTxGas: '0',
            baseGas: '0',
            gasPrice: '0',
            gasToken: '0x0000000000000000000000000000000000000000',
            refundReceiver: '0x0000000000000000000000000000000000000000',
            nonce: await args.protocolKit.getNonce(),
        }
    }

    const typedData = generateTypedData(safeEIP712Args);

    return {
        types: typedData.primaryType === 'SafeMessage'
        ? { SafeMessage: (typedData as EIP712TypedDataMessage).types.SafeMessage }
        : { EIP712Domain: typedData.types.EIP712Domain, SafeTx: (typedData as EIP712TypedDataTx).types.SafeTx },
        primaryType: "SafeTx",
        domain: typedData.domain,
        message: typedData.message,
    };
};

export const executeSignedTypedDataRelayTx = async (args: {
    safe: Safe,
    gelatoRelayPack: GelatoRelayPack,
    metaTransaction: MetaTransactionData,
    signer: string,
    signature: string,
}): Promise<{ taskId: string }> => {
    const adjustedSignature = adjustVInSignature(SigningMethod.ETH_SIGN_TYPED_DATA, args.signature);

    const safeTransaction = new EthSafeTransaction({
        to: args.metaTransaction.to,
        value: args.metaTransaction.value,
        data: args.metaTransaction.data,
        operation: args.metaTransaction.operation ?? OperationType.Call,
        safeTxGas: '0',
        baseGas: '0',
        gasPrice: '0',
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        nonce: await args.safe.getNonce(),
    });

    safeTransaction.addSignature(new EthSafeSignature(args.signer, adjustedSignature, false));

    return executeRelayTransaction({
        gelatoRelayPack: args.gelatoRelayPack,
        signedSafeTransaction: safeTransaction
    });
}

export const executeRelayTransaction = async (args: {
    gelatoRelayPack: GelatoRelayPack,
    signedSafeTransaction: SafeTransaction,
}): Promise<{ taskId: string }> => {
    const { gelatoRelayPack: relayKit, signedSafeTransaction } = args;
    const options: MetaTransactionOptions = {
        isSponsored: true
    }

    const response = await relayKit.executeTransaction({
        executable: signedSafeTransaction,
        options
    });

    console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`);
    return response;
}

export const normalizeMetaTransaction = (args: {
    tx: Transaction
}): MetaTransactionData => {
    const { tx } = args;
    return {
        to: tx.to,
        value: tx.value.toString(),
        data: tx.data,
    };
}
