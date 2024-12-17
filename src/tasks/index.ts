import { rpc, scValToNative } from '@stellar/stellar-sdk';

import { CalcResourceProps } from '@/types/interface';

const handleTxToGetStats = async (
  sim: rpc.Api.SimulateTransactionSuccessResponse,
  tx: rpc.Api.GetSuccessfulTransactionResponse
) => {
  const { transactionData } = sim;
  const resources = transactionData.build().resources();
  const footprint = resources.footprint();

  // const rwro = [
  //   transactionData.getReadWrite().flatMap((rw) => rw.toXDR().length),
  //   transactionData.getReadOnly().flatMap((ro) => ro.toXDR().length),
  // ].flat();

  const metrics: Record<string, number | undefined> = {
    cpu_insn: undefined,
    mem_byte: undefined,
    ledger_read_byte: undefined,
    ledger_write_byte: undefined,
  };

  tx.resultMetaXdr
    .v3()
    .sorobanMeta()
    ?.diagnosticEvents()
    .forEach((e) => {
      const eventBody = e.event().body().v0();
      const topics = eventBody.topics().map(scValToNative);

      const itemData = scValToNative(eventBody.data());
      if (topics.includes('core_metrics')) {
        console.log('==', topics, itemData, '\n');
      }

      if (!topics.includes('core_metrics')) return;

      const matchedMetric = Object.keys(metrics).find((metric) => topics.includes(metric));
      if (matchedMetric) {
        metrics[matchedMetric] = Number(scValToNative(eventBody.data()));
      }
    });

  const entries = tx.resultMetaXdr
    .v3()
    .operations()
    .flatMap((op) =>
      op.changes().flatMap((change) => {
        switch (change.switch().name) {
          case 'ledgerEntryCreated':
            return change.created().data().value().toXDR().length;
          case 'ledgerEntryUpdated':
            return change.updated().data().value().toXDR().length;
          default:
            return 0;
        }
      })
    );

  const entrySize = entries?.length
    ? entries.reduce((pre, next) => {
        return pre + next;
      }, 0)
    : undefined;
  return {
    cpu_insns: metrics.cpu_insn,
    entry_bytes: entrySize,
    mem_bytes: metrics.mem_byte,
    // min_txn_bytes: tx.envelopeXdr.toXDR().length,
    // max_entry_bytes: entries?.length ? Math.max(...entries) : 0,
    entry_reads: footprint.readOnly().length,
    entry_writes: footprint.readWrite().length,
    read_bytes: resources.readBytes(),
    write_bytes: resources.writeBytes(),
    // max_key_bytes: Math.max(...rwro),
  };
};

export const getStats = async ({ tx, rpcServer, keypair, resourceFee = 100_000_000 }: CalcResourceProps) => {
  const simRes = await rpcServer.simulateTransaction(tx);
  const MAX_U32 = 2 ** 32 - 1;

  if (rpc.Api.isSimulationSuccess(simRes)) {
    simRes.minResourceFee = MAX_U32.toString();

    const resources = simRes.transactionData.build().resources();
    const assembleTx = rpc
      .assembleTransaction(tx, simRes)
      .setSorobanData(
        simRes.transactionData
          .setResourceFee(resourceFee)
          .setResources(MAX_U32, resources.readBytes(), resources.writeBytes())
          .build()
      )
      .build();

    assembleTx.sign(keypair);

    try {
      const sendRes = await rpcServer.sendTransaction(assembleTx);

      if (sendRes.status === 'PENDING') {
        await Bun.sleep(5000);
        const getRes = await rpcServer.getTransaction(sendRes.hash);

        if (getRes.status === 'SUCCESS') {
          if (!getRes.resultMetaXdr) {
            throw 'Empty resultMetaXDR in getTransaction response';
          }
          const res = await handleTxToGetStats(simRes, getRes);
          console.log('success===', res);
          return res;
        } else {
          console.log(await rpcServer._getTransaction(sendRes.hash));
        }
      } else {
        console.log(await rpcServer._sendTransaction(assembleTx));
      }
    } catch (error) {
      console.log('Sending transaction failed');
      console.log(JSON.stringify(error));
    }
  } else {
    console.log(await rpcServer._simulateTransaction(tx));
  }
};
