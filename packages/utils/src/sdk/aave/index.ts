import { AAVE_POOL_ABI, AAVE_POOL_PROXY_SEPOLIA } from '../../constants';
import { getContract, JsonRpcProvider, toReadableAmount } from '../../mockable';
import { AaveTokenArgs } from '../../types/aave';

export const getAaveTokenData = async (args: AaveTokenArgs) => {
    const { rpc, tokenAddress } = args;

    const rpcProvider = new JsonRpcProvider(rpc);
    const aaveContract = getContract(AAVE_POOL_PROXY_SEPOLIA, AAVE_POOL_ABI, rpcProvider);

    const res = await aaveContract.getReserveData(tokenAddress);


    return {
        currentSupplyApy: Number(toReadableAmount(res[2], 25)),
        currentVariableBorrowApy: Number(toReadableAmount(res[4], 25)),
        currentStableBorrowApy: Number(toReadableAmount(res[5], 25)),
        totalTreasuryBalance: Number(res[11].toString())
    };
};

export const getReserveConfigurationAave = async (args: AaveTokenArgs) => {
    const { rpc, tokenAddress } = args;

    const rpcProvider = new JsonRpcProvider(rpc);
    const aaveContract = getContract(AAVE_POOL_PROXY_SEPOLIA, AAVE_POOL_ABI, rpcProvider);

    const res = await aaveContract.getConfiguration(tokenAddress);

    return res[0];
}