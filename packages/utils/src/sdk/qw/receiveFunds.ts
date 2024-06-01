import { ethers, TransactionRequest } from "ethers";
import { QW_MANAGER_ABI } from "../../constants"

export type ReceiveFundsParams = {
    contractAddress: string;
    provider: ethers.JsonRpcApiProvider;
    user: string;
    token: string;
    amount: BigInt;
}

export const receiveFunds = (params: ReceiveFundsParams): TransactionRequest => {

    const { contractAddress, amount, provider, user, token } = params;
    try {
        // Connect to the QWManager contract
        const qwManagerContract = new ethers.Contract(contractAddress, QW_MANAGER_ABI, provider);
        const data = qwManagerContract.interface.encodeFunctionData('receiveFunds', [user, token, amount]);

        const transactionObj: TransactionRequest = {
            to: contractAddress,
            data: data
        };
        return transactionObj;
    } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
}
