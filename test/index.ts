import { describe, expect, it } from 'vitest';
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
  it('should work', async () => {
    const initAssembledTx = await contract.init();
    await initAssembledTx.signAndSend();
    const runAssembledTx = await contract.run({
      cpu: 700,
      mem: 180,
      set: 20,
      get: 40,
      events: 1,
      _txn: Buffer.alloc(71_680),
    });
    const runTx = await runAssembledTx.signAndSend();
    expect(runTx.result).toBe(null);
    contract.printTable();
  });
});
