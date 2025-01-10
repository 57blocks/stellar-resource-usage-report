import {
  Keypair,
  Account,
  nativeToScVal,
  TransactionBuilder,
  Operation,
  rpc,
  Contract,
  Networks,
} from '@stellar/stellar-sdk';
import { describe, expect, it, afterAll, beforeEach } from 'vitest';
import { StellarRpcServer } from 'src/main';

describe('StellarRpcServer', async () => {
  let isFirstTest = true;
  beforeEach(async () => {
    if (!isFirstTest) {
      // wait for 8s to ensure that the previous transaction has been successfully uploaded to the chain.
      await new Promise((resolve) => setTimeout(resolve, 8000));
    }
    isFirstTest = false;
  });
  const keypair = Keypair.fromSecret(import.meta.env.VITE_SECRET!);
  const publicKey = keypair.publicKey();
  const rpcUrl = 'http://localhost:8000/rpc';
  const contractId = import.meta.env.VITE_CONTRACT_ID!;
  const networkPassphrase = Networks.STANDALONE;
  const rpcServer = new StellarRpcServer(rpcUrl, { allowHttp: true });
  const sourceAccount = await rpcServer
    .getAccount(publicKey)
    .then((account) => new Account(account.accountId(), account.sequenceNumber()))
    .catch(() => {
      throw new Error(`Issue with ${publicKey} account.`);
    });

  it('should send transaction successfully when use prepareTransaction', async () => {
    const contract = new Contract(contractId);
    const args = [
      nativeToScVal(150, { type: 'u32' }),
      nativeToScVal(2, { type: 'u32' }),
      nativeToScVal(20, { type: 'u32' }),
      nativeToScVal(40, { type: 'u32' }),
      nativeToScVal(1, { type: 'u32' }),
      nativeToScVal(Buffer.alloc(71_680)),
    ];
    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100000000',
      networkPassphrase,
    })
      .addOperation(contract.call('run', ...args))
      .setTimeout(30)
      .build();
    const preparedTx = await rpcServer.prepareTransaction(tx);
    preparedTx.sign(keypair);
    const sendRes = await rpcServer.sendTransaction(preparedTx);
    expect(sendRes.hash).not.to.be.empty.and.to.be.a('HexString');
  });

  it('should send transaction successfully when use simulateTransaction', async () => {
    const args = [
      nativeToScVal(150, { type: 'u32' }),
      nativeToScVal(20, { type: 'u32' }),
      nativeToScVal(2, { type: 'u32' }),
      nativeToScVal(4, { type: 'u32' }),
      nativeToScVal(1, { type: 'u32' }),
      nativeToScVal(Buffer.alloc(71_680)),
    ];

    const tx = new TransactionBuilder(sourceAccount, {
      fee: '0',
      networkPassphrase,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: contractId,
          function: 'run',
          args,
        })
      )
      .setTimeout(0)
      .build();
    const simRes = await rpcServer.simulateTransaction(tx);
    const MAX_U32 = 2 ** 32 - 1;
    if (rpc.Api.isSimulationSuccess(simRes)) {
      simRes.minResourceFee = MAX_U32.toString();
      const resources = simRes.transactionData.build().resources();
      const assembledTx = rpc
        .assembleTransaction(tx, simRes)
        .setSorobanData(
          simRes.transactionData
            .setResourceFee(100_000_000)
            .setResources(MAX_U32, resources.readBytes(), resources.writeBytes())
            .build()
        )
        .build();
      assembledTx.sign(keypair);

      const sendRes = await rpcServer.sendTransaction(assembledTx);
      expect(sendRes.hash).not.to.be.empty.and.to.be.a('HexString');
    }
  });

  afterAll(async () => {
    await rpcServer.printTable();
  });
});
