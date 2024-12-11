import { printTable } from '@/share';
import { describe, it, expect } from 'vitest';

describe('main', () => {
  it('log table data', () => {
    const tableObj = {
      cpu_insns: 132918280,
      mem_bytes: 48017296,
      entry_reads: 43,
      entry_writes: 21,
      read_bytes: 212012,
      write_bytes: 68452,
      events_and_return_bytes: 8272,
      min_txn_bytes: 76132,
      max_entry_bytes: 66920,
      max_key_bytes: 352,
    };
    const tableData = Object.entries(tableObj);
    expect(printTable(tableData)).toEqual(tableData);
  });
});
