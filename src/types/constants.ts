export const STELLAR_LIMITS_CONFIG = {
  mem_bytes: 40 * 1024 * 1024,
  cpu_insns: 100 * 1000000,
  entry_reads: 40,
  entry_writes: 25,
  read_bytes: 200 * 1024,
  write_bytes: 129 * 1024,

  // These are not part of the standard
  max_key_bytes: 1000,
  min_txn_bytes: 100 * 1024,
  max_entry_bytes: 1000 * 1024,
} as const;
