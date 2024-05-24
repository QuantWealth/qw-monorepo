import { expect } from "chai";
import { createStubInstance, SinonStubbedInstance, stub, restore } from "sinon";
import { ethers } from "ethers";
import { describe, beforeEach, afterEach, it } from "mocha";
import { Transaction, TransactionState, TransactionService } from "../src";
import { TransactionStorage } from "../src/storage";
import { TransactionServiceError } from "src/errors";

// Define a test transaction receipt.
const TEST_TX_RECEIPT: ethers.providers.TransactionReceipt = {
  blockHash: "0xabc",
  blockNumber: 123,
  byzantium: true,
  confirmations: 1,
  contractAddress: "0x123456789abcdef123456789abcdef123456789a",
  cumulativeGasUsed: ethers.BigNumber.from(21000),
  from: "0x1231231231231231231231231231231231231231",
  gasUsed: ethers.BigNumber.from(21000),
  logs: [],
  logsBloom: "0x",
  to: "0x4564564564564564564564564564564564564564",
  transactionHash: "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234567",
  transactionIndex: 1,
  status: 1,
  effectiveGasPrice: ethers.BigNumber.from(1000000000),
  type: 0,
};

const TEST_TX_RESPONSE: ethers.providers.TransactionResponse = {
  hash: "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234567",
  to: "0x4564564564564564564564564564564564564564",
  from: "0x1231231231231231231231231231231231231231",
  nonce: 1,
  gasLimit: ethers.BigNumber.from(21000),
  gasPrice: ethers.BigNumber.from(1000000000),
  data: "0x",
  value: ethers.BigNumber.from(0),
  chainId: 1,
  blockHash: "0xtest",
  blockNumber: 9,
  confirmations: 0,
  wait: async (confirmations?: number) => TEST_TX_RECEIPT,
};

describe("TransactionService", () => {
  let transactionService: TransactionService;
  let providerStub: SinonStubbedInstance<ethers.providers.JsonRpcProvider>;
  let signerStub: SinonStubbedInstance<ethers.Wallet>;
  let storageStub: SinonStubbedInstance<TransactionStorage>;

  beforeEach(() => {
    // Create stubs for the ethers provider, signer, and storage.
    providerStub = createStubInstance(ethers.providers.JsonRpcProvider);
    signerStub = createStubInstance(ethers.Wallet);
    storageStub = createStubInstance(TransactionStorage);

    // Mock configuration.
    const config = {
      1: {
        providers: ["http://localhost:8545"],
        confirmationsRequired: 1,
        timeout: 1000,
        targetProvidersPerCall: 1,
        gasPriceMax: "10000000000",
        gasPriceMin: "1000000000",
        gasPriceBump: "0.1",
        quorum: 1,
        maxRetries: 3
      }
    };

    // Initialize the TransactionService.
    transactionService = new TransactionService(config, signerStub);
    (transactionService as any).storage = storageStub; // Replace storage with stub

    // Mock the provider's sendTransaction method to return a dummy transaction response.
    signerStub.sendTransaction.resolves({
      hash: "0x123",
      nonce: 1,
      gasLimit: ethers.BigNumber.from(21000),
      gasPrice: ethers.BigNumber.from(1000000000),
      value: ethers.BigNumber.from(0),
      data: "0x",
      chainId: 1,
      from: "0x0000000000000000000000000000000000000000",
      confirmations: 0,
      wait: async () => TEST_TX_RECEIPT,
    });

    // Mock the provider's call method to return a dummy response.
    providerStub.call.resolves("dummy_response");
    // Stub the getGasPrice method of the provider to return a valid gas price.
    providerStub.getGasPrice.resolves(ethers.BigNumber.from("1000000000"));
    providerStub.getTransactionCount.resolves(1);

    // Stub the makeProvider method of the TransactionService to return the mocked provider.
    stub(transactionService as any, "makeProvider").returns(providerStub);
  });

  afterEach(() => {
    // Restore the original functionality of the stubs.
    restore();
  });

  it("should perform a read transaction and return the response", async () => {
    const txDetails = {
      chainId: 1,
      to: "0x0000000000000000000000000000000000000000",
      data: "0x"
    };

    try {
      // Call the read method of the TransactionService.
      const response = await transactionService.read(txDetails);

      // Assert that the response is as expected.
      expect(response).to.equal("dummy_response");

      // Assert that the provider's call method was called once with the correct arguments.
      expect(providerStub.call.calledOnceWithExactly({
        to: txDetails.to,
        data: txDetails.data
      })).to.be.true;
    } catch (error) {
      console.error("Error during read transaction:", error);
      throw error;
    }
  });

  it("should perform a write transaction and return the transaction object", async () => {
    signerStub.sendTransaction.resolves(TEST_TX_RESPONSE);

    const txDetails = {
      chainId: 1,
      to: "0x0000000000000000000000000000000000000000",
      value: "1000",
      data: "0x"
    };

    const expectedTransaction: Transaction = {
      chainId: 1,
      to: "0x0000000000000000000000000000000000000000",
      value: "1000",
      data: "0x",
      nonce: 1,
      response: TEST_TX_RESPONSE,
      receipt: TEST_TX_RECEIPT,
      state: TransactionState.Confirmed,
    };

    // TODO: Stubbing monitor here, need a unit test for that.
    stub(transactionService as any, "monitor").resolves(expectedTransaction);

    // Call the write method of the TransactionService.
    const result = await transactionService.write(txDetails);
    expect(result).to.not.be.instanceOf(TransactionServiceError);
    const transaction = result as Transaction;

    // Assert that the returned transaction object has the expected properties.
    expect(transaction).to.include({
      chainId: 1,
      gasLimit: ethers.utils.parseUnits(txDetails.value, "wei").toString(),
      state: TransactionState.Submitted,
    });
    // Assert that the callback is called with the confirmed transaction.
    expect(transaction.state).to.equal(TransactionState.Confirmed);
    // Assert that the transaction receipt is as expected.
    expect(transaction.receipt).to.deep.equal(TEST_TX_RECEIPT);
    // TODO: response should be equal to test response

    // Assert that the storage's add method was called with the transaction.
    expect(storageStub.add.calledOnceWith(transaction)).to.be.true;
    // TODO: Should have also called remove.
  });
});
