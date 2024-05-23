import { expect } from "chai";
import Sinon, { restore, createStubInstance, SinonStubbedInstance } from "sinon";
import { ethers } from "ethers";
import { TransactionService } from "../src/txservice";
import { describe, beforeEach, afterEach, it } from "mocha";

describe("TransactionService", () => {
  let transactionService: TransactionService;
  let providerStub: SinonStubbedInstance<ethers.providers.JsonRpcProvider>;
  let signerStub: SinonStubbedInstance<ethers.Wallet>;

  beforeEach(() => {
    // Create stubs for the ethers provider and signer.
    providerStub = createStubInstance(ethers.providers.JsonRpcProvider);
    signerStub = createStubInstance(ethers.Wallet);

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

    // Mock the provider's call method to return a dummy response.
    providerStub.call.resolves("dummy_response");

    // Stub the ethers.providers.JsonRpcProvider constructor to return the mocked provider.
    Sinon.stub(ethers.providers, "JsonRpcProvider").returns(providerStub as any);
  });

  afterEach(() => {
    // Restore the original functionality of the stubs.
    Sinon.restore();
  });

  it("should perform a read transaction and return the response", async () => {
    const txDetails = {
      chainId: 1,
      to: "0x0000000000000000000000000000000000000000",
      data: "0x"
    };

    // Call the read method of the TransactionService.
    const response = await transactionService.read(txDetails);

    // Assert that the response is as expected.
    expect(response).to.equal("dummy_response");

    // Assert that the provider's call method was called once with the correct arguments.
    expect(providerStub.call.calledOnceWithExactly({
      to: txDetails.to,
      data: txDetails.data
    })).to.be.true;
  });
});


// import { expect } from "chai";
// import Sinon, { createStubInstance } from "sinon";
// import { describe, it } from "mocha";
// import { ethers } from "ethers";

// describe("Simple Test", () => {
//   it("should pass", () => {
//     expect(true).to.be.true;
//   });

//   it("should create a stub instance", () => {
//     const providerStub = createStubInstance(ethers.providers.JsonRpcProvider);
//     expect(providerStub).to.be.an("object");
//   });
// });


// import { expect } from "chai";
// import Sinon, { restore, reset, createStubInstance, SinonStubbedInstance } from "sinon";
// import { ethers } from "ethers";
// import { TransactionService } from "../src/txservice";
// import { describe, beforeEach, afterEach, it } from "mocha";

// describe("TransactionService", () => {
//   let transactionService: TransactionService;
//   let providerStub: SinonStubbedInstance<ethers.providers.JsonRpcProvider>;
//   let signerStub: SinonStubbedInstance<ethers.Wallet>;

//   beforeEach(() => {
//     // Create stubs for the ethers provider and signer.
//     providerStub = createStubInstance(ethers.providers.JsonRpcProvider);
//     signerStub = createStubInstance(ethers.Wallet);

//     // Mock configuration.
//     const config = {
//       1: {
//         providers: ["http://localhost:8545"],
//         confirmationsRequired: 1,
//         timeout: 1000,
//         targetProvidersPerCall: 1,
//         gasPriceMax: "10000000000",
//         gasPriceMin: "1000000000",
//         gasPriceBump: "0.1",
//         quorum: 1,
//         maxRetries: 3
//       }
//     };

//     // Initialize the TransactionService.
//     transactionService = new TransactionService(config, signerStub);

//     // Mock the provider's call method to return a dummy response.
//     providerStub.call.resolves("dummy_response");

//     // Stub the ethers.providers.JsonRpcProvider constructor to return the mocked provider.
//     Sinon.stub(ethers.providers, "JsonRpcProvider").returns(providerStub as any);
//   });

//   afterEach(() => {
//     // Restore the original functionality of the stubs.
//     restore();
//     reset();
//   });

//   it("should perform a read transaction and return the response", async () => {
//     const txDetails = {
//       chainId: 1,
//       to: "0x0000000000000000000000000000000000000000",
//       data: "0x"
//     };

//     // Call the read method of the TransactionService.
//     const response = await transactionService.read(txDetails);

//     // Assert that the response is as expected.
//     expect(response).to.equal("dummy_response");

//     // Assert that the provider's call method was called once with the correct arguments.
//     expect(providerStub.call.calledOnceWithExactly({
//       to: txDetails.to,
//       data: txDetails.data
//     })).to.be.true;
//   });
// });
