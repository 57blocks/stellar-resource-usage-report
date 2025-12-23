import { rpc, scValToNative } from '@stellar/stellar-sdk';
import { AssembledTransaction } from '@stellar/stellar-sdk/contract';

import { STELLAR_LIMITS_CONFIG } from '@/constants';

const isSimTx = (
  tx: rpc.Api.SimulateTransactionSuccessResponse | AssembledTransaction<null>
): tx is rpc.Api.SimulateTransactionSuccessResponse => {
  return 'transactionData' in tx;
};
export const handleTxToGetStats = (
  tx: rpc.Api.SimulateTransactionSuccessResponse | AssembledTransaction<null>,
  successfulTx: rpc.Api.GetSuccessfulTransactionResponse
): Record<keyof typeof STELLAR_LIMITS_CONFIG, number | undefined> => {
  let resources;
  if (isSimTx(tx)) {
    resources = tx.transactionData.build().resources();
  } else {
    resources = tx.simulationData.transactionData.resources();
  }
  const footprint = resources.footprint();

  const metrics: Record<string, number | undefined> = {
    cpu_insn: undefined,
    mem_byte: undefined,
    ledger_read_byte: undefined,
    ledger_write_byte: undefined,
  };

  successfulTx.resultMetaXdr
    .v3()
    .sorobanMeta()
    ?.diagnosticEvents()
    .forEach((e) => {
      const eventBody = e.event().body().v0();
      const topics = eventBody.topics().map(scValToNative);

      if (!topics.includes('core_metrics')) return;

      const matchedMetric = Object.keys(metrics).find((metric) => topics.includes(metric));
      if (matchedMetric) {
        metrics[matchedMetric] = Number(scValToNative(eventBody.data()));
      }
    });

  const entries = successfulTx.resultMetaXdr
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

  const entrySize = Math.max(...entries) ?? 0;
  return {
    cpu_insns: metrics.cpu_insn,
    mem_bytes: metrics.mem_byte,
    entry_bytes: entrySize,
    entry_reads: footprint.readOnly().length,
    entry_writes: footprint.readWrite().length,
    read_bytes: resources.diskReadBytes(),
    write_bytes: resources.writeBytes(),
    min_txn_bytes: successfulTx.envelopeXdr.toXDR().length,
  };
};
