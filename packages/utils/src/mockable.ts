import { Contract, JsonRpcProvider, formatUnits, parseUnits, AbiCoder } from 'ethers';

export { JsonRpcProvider, AbiCoder };

export const toReadableAmount = (amount: bigint, decimals: number): string => {
    return formatUnits(amount, decimals);
}

export const fromReadableAmount = (amount: number, decimals: number): bigint => {
    return parseUnits(amount.toString(), decimals);
}

export const getContract = (address: string, abi: any[], provider: JsonRpcProvider) => {
    return new Contract(address, abi, provider);
}