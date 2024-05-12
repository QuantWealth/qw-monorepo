import { CCOMPOUND_TOKEN_ABI } from 'src/constants';
import { getContract, JsonRpcProvider } from 'src/mockable';

export type CompoundTokenAprArgs = {
    rpc: string;
    contractAddress: string;
};

export const getCompoundTokenApr = async (args: CompoundTokenAprArgs) => {
    const { rpc, contractAddress } = args;

    const rpcProvider = new JsonRpcProvider(rpc);
    const cTokenContract = getContract(contractAddress, CCOMPOUND_TOKEN_ABI, rpcProvider);

    const utilization = await cTokenContract.getUtilization();
    const res = await cTokenContract.getSupplyRate(utilization);

    return res;
};