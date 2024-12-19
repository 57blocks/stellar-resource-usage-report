export const STELLAR_LIMITS_CONFIG = {
  // Memory limit per txn
  mem_bytes: {
    value: 40 * 1024 * 1024,
    unit: 'bytes',
    lable: '40 MB',
  },
  // Max CPU instructions per txn
  cpu_insns: {
    value: 100 * 1000000,
    unit: 'bytes',
    lable: '100 Million',
  },
  // Read ledger entries per txn
  entry_reads: {
    value: 40,
    unit: 'count',
    lable: '40',
  },
  // Write ledger entries per txn
  entry_writes: {
    value: 25,
    unit: 'count',
    lable: '25',
  },
  // Read bytes per txn
  read_bytes: {
    value: 200 * 1024,
    unit: 'bytes',
    lable: '200 KB',
  },
  // Write bytes per txn
  write_bytes: {
    value: 129 * 1024,
    unit: 'bytes',
    lable: '129 KB',
  },
  /**
   *  Ledger entry size (including Wasm entries) per txn
   *  📢Actually, this limit is the max single ledger entry size.
   *  You can write 25 keys with a sum total size of 129 KB and a single key max of 128 KB
   *  */
  entry_bytes: {
    value: 128 * 1024,
    unit: 'bytes',
    lable: '128 KB',
  },
  // Transaction size
  min_txn_bytes: {
    value: 129 * 1024,
    unit: 'bytes',
    lable: '129 KB',
  },
};
