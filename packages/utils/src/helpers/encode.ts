import { CoderFunctionParams, CoderFunctionTypes } from '../types';
import { AbiCoder } from '../mockable';

export const encodeExternalCallData = (paramTypes: CoderFunctionTypes, params: CoderFunctionParams) => {
    return AbiCoder.defaultAbiCoder().encode(paramTypes, params);
}