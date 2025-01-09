import { describe, expect, it, afterAll } from 'vitest';
import { basicNodeSigner } from '@stellar/stellar-sdk/contract';
import { Client, networks } from 'test-contract/src';
import { ResourceUsageClient } from 'src/main';
import { Keypair } from '@stellar/stellar-sdk';

describe('Client', async () => {
  // set env SECRET
  const keypair = Keypair.fromSecret(import.meta.env.VITE_SECRET!);
  const pubkey = keypair.publicKey();
  const { signTransaction } = basicNodeSigner(keypair, networks.standalone.networkPassphrase);
  const contract = await ResourceUsageClient<Client>(Client, {
    contractId: networks.standalone.contractId,
    networkPassphrase: networks.standalone.networkPassphrase,
    rpcUrl: 'http://localhost:8000/soroban/rpc',
    publicKey: pubkey,
    allowHttp: true,
    signTransaction,
  });
  it('should init successfully', async () => {
    const initAssembledTx = await contract.init();
    const initTx = await initAssembledTx.signAndSend();
    expect(initTx.getTransactionResponse?.txHash).not.to.be.empty.and.to.be.a('HexString');
  });
  it('should run successfully', async () => {
    const runAssembledTx = await contract.run({
      cpu: 700,
      mem: 180,
      set: 20,
      get: 40,
      events: 1,
      _txn: Buffer.alloc(71_680),
    });
    const runTx = await runAssembledTx.signAndSend();
    expect(runTx.getTransactionResponse?.txHash).not.to.be.empty.and.to.be.a('HexString');
    expect(runTx.result).toBe(null);
  });
  afterAll(() => {
    contract.printTable();
  });
});
