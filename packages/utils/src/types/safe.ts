import Safe, { SafeProviderConfig } from "@safe-global/protocol-kit";

export type SafeSdkArgs = {
  address: string;
};

export type CreateSafeSdkArgs = {
    rpc: string;
    address: string;
    safe?: Safe;
    signer?: SafeProviderConfig["signer"];
};

export type DeployedSafeArgs = {
    rpc: string;
    signer: string; // private key
    safeAddress: string;
}
