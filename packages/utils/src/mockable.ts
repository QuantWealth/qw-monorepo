import { Contract, JsonRpcProvider, parseUnits } from 'ethers';

export { JsonRpcProvider };

export const fromReadableAmount = (amount: number, decimals: number): bigint => {
    return parseUnits(amount.toString(), decimals);
}

export const getContract = (address: string, abi: any[], provider: JsonRpcProvider) => {
    return new Contract(address, abi, provider);
}