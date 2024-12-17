import { rpc, scValToNative } from '@stellar/stellar-sdk';

import { TXResourceUsageStats } from '@/types';

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
  const metrics: Record<string, number | undefined> = {
    cpu_insn: undefined,
    mem_byte: undefined,
    ledger_read_byte: undefined,
    ledger_write_byte: undefined,
  };

  tx?.resultMetaXdr
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
    mem_bytes: metrics.mem_byte,
    cpu_insns: metrics.cpu_insn,
    min_txn_bytes: tx ? tx.envelopeXdr.toXDR().length : undefined,
    max_entry_bytes: tx ? (entries?.length ? Math.max(...entries) : 0) : undefined,
  };
};
