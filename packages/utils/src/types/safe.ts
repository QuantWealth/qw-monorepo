import Safe from "@safe-global/protocol-kit";

export type SafeSdkArgs = {
    address: string;
};

export type CreateSafeSdkArgs = {
    rpc: string;
    address: string;
    safe?: Safe;
};