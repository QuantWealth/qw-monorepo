import Safe, { PredictedSafeProps } from '@safe-global/protocol-kit';
import { Transaction } from '@safe-global/safe-core-sdk-types';
import { CreateSafeSdkArgs, SafeSdkArgs } from '../../types/safe';


const _getPredictedSafeConfig = (args: SafeSdkArgs): PredictedSafeProps => {
    const safeVersionDeployed = '1.4.1';

    return {
        safeAccountConfig: {
            owners: [args.address],
            threshold: 1,
        },
        safeDeploymentConfig: {
            safeVersion: safeVersionDeployed,
        },
    };
}

export const initSCW = async (args: CreateSafeSdkArgs): Promise<Safe> => { 
    const predictedSafe = _getPredictedSafeConfig(args);

    return Safe.init({
        provider: args.rpc,
        predictedSafe,
    });
}

export const initQW = async (args: CreateSafeSdkArgs): Promise<Safe> => { 

    return Safe.init({
        provider: args.rpc,
        signer: args.signer,
        safeAddress: args.address,
    });
}

export const createSCW = async (args: CreateSafeSdkArgs): Promise<Transaction> => {
    if(await args.safe.isSafeDeployed()) {
        throw new Error('Safe already deployed');
    }

    const deploymentTransaction =
        await args.safe.createSafeDeploymentTransaction();

    return deploymentTransaction;
}


export const getSCW = async (args: CreateSafeSdkArgs): Promise<string> => {
    const address = await args.safe.getAddress();
    return address;
}

export const isSCWDeployed = async (args: CreateSafeSdkArgs): Promise<boolean> => {
    return await args.safe.isSafeDeployed();
}