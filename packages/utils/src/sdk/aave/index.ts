import { AAVE_POOL_ABI, AAVE_POOL_PROXY_SEPOLIA } from 'src/constants';
import { getContract, JsonRpcProvider } from 'src/mockable';

export type AaveTokenArgs = {
    rpc: string;
    tokenAddress: string;
};


export const getAaveTokenApr = async (args: AaveTokenArgs) => {
    const { rpc, tokenAddress } = args;

    const rpcProvider = new JsonRpcProvider(rpc);
    const aaveContract = getContract(AAVE_POOL_PROXY_SEPOLIA, AAVE_POOL_ABI, rpcProvider);

    const res = await aaveContract.getReserveData(tokenAddress);

    return res;
};

export const getReserveConfigurationAave = async (args: AaveTokenArgs) => {
    const { rpc, tokenAddress } = args;

    const rpcProvider = new JsonRpcProvider(rpc);
    const aaveContract = getContract(AAVE_POOL_PROXY_SEPOLIA, AAVE_POOL_ABI, rpcProvider);

    const res = await aaveContract.getConfiguration(tokenAddress);

    return res;
}