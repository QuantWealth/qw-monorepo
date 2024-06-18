import { ethers, TransactionRequest } from "ethers";
import { QW_MANAGER_ABI } from "../../constants"

export type ExecuteParams = {
    contractAddress: string;
    provider: ethers.JsonRpcApiProvider;
    target: string[];
    callData: string[];
    tokens: string;
    amount: BigInt;
}

export const execute = (params: ExecuteParams): TransactionRequest => {

    const { contractAddress, amount, provider, target, callData, tokens } = params;
    try {
        // Connect to the QWManager contract
        const qwManagerContract = new ethers.Contract(contractAddress, QW_MANAGER_ABI, provider);
        const data = qwManagerContract.interface.encodeFunctionData('execute', [target, callData, tokens, amount]);

        const transactionObj: TransactionRequest = {
            to: contractAddress,
            data: data,
            value: 0n
        };
        return transactionObj;
    } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
}
