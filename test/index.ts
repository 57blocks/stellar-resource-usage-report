import { describe, it, expect } from 'vitest';

import { printTable } from '@/share';
import { STELLAR_LIMITS_CONFIG } from '@/types/constants';

describe('main', () => {
  it('log table data', () => {
    const tableObj = {
      cpu_insns: 132918280,
      mem_bytes: 48017296,
      entry_reads: 43,
      entry_writes: 21,
      read_bytes: 212012,
      write_bytes: 68452,
    };

    const res: (string | number)[][] = [];

    Object.entries(tableObj).forEach(([key, value]) => {
      const limit = STELLAR_LIMITS_CONFIG[key as 'cpu_insns'];
      const isExceeded = limit ? value > limit : false;
      const isTaken80 = limit ? value > limit * 0.8 : false;

      const percent = ((value / limit) * 100).toFixed(2) + ' %';
      res.push([key, value, limit, isExceeded ? `❌ (used ${percent})` : isTaken80 ? `ℹ️ (used ${percent})` : '✅']);
    });
    // const tableData = Object.entries(tableObj);
    expect(printTable(res)).toEqual(res);
  });
});
