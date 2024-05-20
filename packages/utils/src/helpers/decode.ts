import { CoderFunctionTypes } from "../types";
import { AbiCoder } from "../mockable";
import { BytesLike } from "ethers";

export const decodeExternalCallData = (paramTypes: CoderFunctionTypes, data: BytesLike) => {
  return AbiCoder.defaultAbiCoder().decode(paramTypes, data);
};
