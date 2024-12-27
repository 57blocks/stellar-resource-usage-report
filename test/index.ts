import { describe, it, expect } from 'vitest';

import { printTable } from '@/share';
import { STELLAR_LIMITS_CONFIG } from '@/constants';

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
      const percent = parseFloat(((value / limit.value) * 100).toFixed(2));
      res.push([key, value, limit.label, percent]);
    });
    expect(printTable(res)).toEqual(res);
  });
});
