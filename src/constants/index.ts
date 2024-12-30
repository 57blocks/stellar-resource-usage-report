export const STELLAR_LIMITS_CONFIG = {
  // Memory limit per txn
  mem_bytes: {
    value: 40 * 1024 * 1024,
    unit: 'bytes',
    label: '40 MB',
  },
  // Max CPU instructions per txn
  cpu_insns: {
    value: 100 * 1000000,
    unit: 'bytes',
    label: '100 Million',
  },
  // Read ledger entries per txn
  entry_reads: {
    value: 40,
    unit: 'count',
    label: '40',
  },
  // Write ledger entries per txn
  entry_writes: {
    value: 25,
    unit: 'count',
    label: '25',
  },
  // Read bytes per txn
  read_bytes: {
    value: 200 * 1024,
    unit: 'bytes',
    label: '200 KB',
  },
  // Write bytes per txn
  write_bytes: {
    value: 129 * 1024,
    unit: 'bytes',
    label: '129 KB',
  },
  /**
   *  Ledger entry size (including Wasm entries) per txn
   *  📢Actually, this limit is the max single ledger entry size.
   *  You can write 25 keys with a sum total size of 129 KB and a single key max of 128 KB
   *  */
  entry_bytes: {
    value: 128 * 1024,
    unit: 'bytes',
    label: '128 KB',
  },
  // Transaction size
  min_txn_bytes: {
    value: 129 * 1024,
    unit: 'bytes',
    label: '129 KB',
  },
};

export const MetricKeys = [
  'cpu_insns',
  'mem_bytes',
  'entry_bytes',
  'entry_reads',
  'entry_writes',
  'read_bytes',
  'write_bytes',
  'min_txn_bytes',
];
