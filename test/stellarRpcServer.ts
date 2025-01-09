import { Keypair, Account, nativeToScVal, TransactionBuilder, Operation, rpc, Networks } from '@stellar/stellar-sdk';
import { describe, expect, it, afterAll } from 'vitest';
import { StellarRpcServer } from 'src/main';

describe('StellarRpcServer', async () => {
  // set env SECRET
  const keypair = Keypair.fromSecret(import.meta.env.VITE_SECRET!);
  const publicKey = keypair.publicKey();
  const rpcUrl = 'http://localhost:8000/rpc';
  const contractId = import.meta.env.VITE_CONTRACT_ID!;
  const networkPassphrase = Networks.STANDALONE;
  const rpcServer = new StellarRpcServer(rpcUrl, { allowHttp: true });

  it('should send transaction successfully', async () => {
    const args = [
      nativeToScVal(150, { type: 'u32' }),
      nativeToScVal(20, { type: 'u32' }),
      nativeToScVal(2, { type: 'u32' }),
      nativeToScVal(4, { type: 'u32' }),
      nativeToScVal(1, { type: 'u32' }),
      nativeToScVal(Buffer.alloc(71_680)),
    ];
    const sourceAccount = await rpcServer
      .getAccount(publicKey)
      .then((account) => new Account(account.accountId(), account.sequenceNumber()))
      .catch(() => {
        throw new Error(`Issue with ${publicKey} account.`);
      });
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
      .setTimeout(30)
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
  await afterAll(async () => {
    await rpcServer.printTable();
  });
});
