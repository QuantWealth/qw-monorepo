import { CCOMPOUND_TOKEN_ABI, SECONDS_PER_YEAR } from '../../constants';
import { getContract, JsonRpcProvider } from '../../mockable';
import { CompoundContractArgs } from '../../types/compound';

export const getCompoundTokenSupplyApr = async (args: CompoundContractArgs) => {
    const { rpc, contractAddress } = args;

    const rpcProvider = new JsonRpcProvider(rpc);
    const cTokenContract = getContract(contractAddress, CCOMPOUND_TOKEN_ABI, rpcProvider);

    const utilization = await cTokenContract.getUtilization();
    const res = await cTokenContract.getSupplyRate(utilization);

    const supplyApr = Number(res.toString() / 1e18 * SECONDS_PER_YEAR * 100)

    return supplyApr;
};

export const getCompoundTokenTotalSupply = async (args: CompoundContractArgs) => {
    const { rpc, contractAddress } = args;

    const rpcProvider = new JsonRpcProvider(rpc);
    const cTokenContract = getContract(contractAddress, CCOMPOUND_TOKEN_ABI, rpcProvider);

    const res = await cTokenContract.totalSupply();

    return Number(res.toString());
};

export const getCompoundTokenTotalBorrow = async (args: CompoundContractArgs) => {
    const { rpc, contractAddress } = args;

    const rpcProvider = new JsonRpcProvider(rpc);
    const cTokenContract = getContract(contractAddress, CCOMPOUND_TOKEN_ABI, rpcProvider);

    const res = await cTokenContract.totalBorrow();

    return Number(res.toString());
};