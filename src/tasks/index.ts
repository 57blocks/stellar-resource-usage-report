import { rpc, scValToNative } from '@stellar/stellar-sdk';

import { anyObj, TXResourceUsageStats } from '@/types';

export const getStatsFromTxRes = (sim: rpc.Api.SimulateTransactionSuccessResponse): TXResourceUsageStats => {
  const sorobanTransactionData = sim.transactionData;
  const resources = sorobanTransactionData.build().resources();
  const footprint = resources.footprint();

  const rwro = [
    sorobanTransactionData.getReadWrite().flatMap((rw) => rw.toXDR().length),
    sorobanTransactionData.getReadOnly().flatMap((ro) => ro.toXDR().length),
  ].flat();

  return {
    mem_bytes: resources.instructions(),
    entry_reads: footprint.readOnly().length,
    entry_writes: footprint.readWrite().length,
    read_bytes: resources.readBytes(),
    write_bytes: resources.writeBytes(),
    max_key_bytes: Math.max(...rwro),
  };
};

export const getStatsFromTx = (tx?: rpc.Api.GetSuccessfulTransactionResponse) => {
  if (!tx || !tx.resultMetaXdr) return {};
  const metrics: anyObj = {
    mem_byte: null,
  };

  tx?.resultMetaXdr
    .v3()
    .sorobanMeta()
    ?.diagnosticEvents()
    .forEach((e) => {
      const event = e.event();
      const topics = event.body().v0().topics();
      const is_core_metrics_event = topics.some((topic) => scValToNative(topic) === 'core_metrics');

      for (const metric in metrics) {
        const is_metric = topics.some((topic) => scValToNative(topic) === metric);

        if (is_core_metrics_event && is_metric) metrics[metric] = Number(scValToNative(event.body().v0().data()));
      }
    });

  const entries = tx?.resultMetaXdr
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

  return {
    min_txn_bytes: tx ? tx.envelopeXdr.toXDR().length : undefined,
    max_entry_bytes: tx ? (entries?.length ? Math.max(...entries) : 0) : undefined,
    mem_bytes: metrics.mem_byte,
  };
};
