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

export const createSCW = async (args: CreateSafeSdkArgs): Promise<Transaction> => {
    const predictedSafe = _getPredictedSafeConfig(args);

    const safeSdk = await Safe.init({
        provider: args.rpc,
        predictedSafe,
    });

    if(await safeSdk.isSafeDeployed()) {
        throw new Error('Safe already deployed');
    }

    const deploymentTransaction =
        await safeSdk.createSafeDeploymentTransaction();

    return deploymentTransaction;
}


export const getSCW = async (args: CreateSafeSdkArgs): Promise<string> => {
    const predictedSafe = _getPredictedSafeConfig(args);

    const safeSdk = await Safe.init({
        provider: args.rpc,
        predictedSafe,
    });

    const address = await safeSdk.getAddress();
    console.log(address);
    return address;
}

export const isSCWDeployed = async (args: CreateSafeSdkArgs): Promise<boolean> => {
    const predictedSafe = _getPredictedSafeConfig(args);

    const safeSdk = await Safe.init({
        provider: args.rpc,
        predictedSafe,
    });

    return await safeSdk.isSafeDeployed();
}