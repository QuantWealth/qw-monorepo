import { CoderFunctionParams, CoderFunctionTypes } from 'src/types';
import { AbiCoder } from '../mockable';

export const encodeExternalCallData = (paramTypes: CoderFunctionTypes, params: CoderFunctionParams) => {
    return AbiCoder.defaultAbiCoder().encode(paramTypes, params);
}