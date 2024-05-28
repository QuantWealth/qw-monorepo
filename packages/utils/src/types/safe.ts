import Safe from "@safe-global/protocol-kit";

export type SafeSdkArgs = {
    address: string;
};

export type CreateSafeSdkArgs = {
    safe: Safe;
    rpc: string;
    address: string;
};