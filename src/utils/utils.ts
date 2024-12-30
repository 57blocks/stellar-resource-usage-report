import { transform, isObject, isArray } from 'lodash-es';

import { STELLAR_LIMITS_CONFIG } from '../constants';
import { getProtocolHistory } from '@/api/stellar';

// This time corresponds to the value in the STELLAR_LIMITS_CONFIG
let TIMESTAMP = 1735537317419;

export const updateTxLimits = async () => {
  if (Date.now() - TIMESTAMP < 60 * 60 * 1000) return;
  TIMESTAMP = Date.now();

  try {
    const data = await getProtocolHistory();
    const flattenData = data
      .map((history: any) => {
        return flattenObjectWithFilter(history.config_changes, ['contractCompute', 'contractLedgerCost']);
      })
      .filter((item: any) => Object.keys(item).length > 0);
    const contractLimitData = flattenData.reverse().reduce((final: Record<string, any>, item: Record<string, any>) => {
      return { ...final, ...item };
    }, {});
    // TODO: didn't update label, because it may be deleted.
    const txLimits = {
      ...STELLAR_LIMITS_CONFIG,
      cpu_insns: {
        ...STELLAR_LIMITS_CONFIG.cpu_insns,
        value: contractLimitData.contractCompute.txMaxInstructions ?? STELLAR_LIMITS_CONFIG.cpu_insns.value,
      },
      mem_bytes: {
        ...STELLAR_LIMITS_CONFIG.mem_bytes,
        value: contractLimitData.contractLedgerCost.txMemoryLimit ?? STELLAR_LIMITS_CONFIG.mem_bytes.value,
      },
      entry_reads: {
        ...STELLAR_LIMITS_CONFIG.entry_reads,
        value: contractLimitData.contractLedgerCost.txMaxReadLedgerEntries ?? STELLAR_LIMITS_CONFIG.entry_reads.value,
      },
      entry_writes: {
        ...STELLAR_LIMITS_CONFIG.entry_writes,
        value: contractLimitData.contractLedgerCost.txMaxWriteLedgerEntries ?? STELLAR_LIMITS_CONFIG.entry_writes.value,
      },
      read_bytes: {
        ...STELLAR_LIMITS_CONFIG.read_bytes,
        value: contractLimitData.contractLedgerCost.txMaxReadBytes ?? STELLAR_LIMITS_CONFIG.read_bytes.value,
      },
      write_bytes: {
        ...STELLAR_LIMITS_CONFIG.write_bytes,
        value: contractLimitData.contractLedgerCost.txMaxWriteBytes ?? STELLAR_LIMITS_CONFIG.write_bytes.value,
      },
    };
    // @ts-ignore
    STELLAR_LIMITS_CONFIG = txLimits;
  } catch (error) {
    console.log(error);
  }
};

export const flattenObjectWithFilter = (obj: object, allowedPaths: string[], prefix = '') => {
  return transform(
    obj,
    (result: Record<string, any>, value, key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;

      const shouldInclude = allowedPaths.some((allowedPath) => {
        if (newKey === allowedPath) return true;
        if (newKey.startsWith(allowedPath + '.')) return true;
        if (allowedPath.startsWith(newKey + '.')) return true;
        return false;
      });

      if (!shouldInclude) return;

      if (isObject(value) && !isArray(value)) {
        Object.assign(result, flattenObjectWithFilter(value, allowedPaths, newKey));
      } else {
        result[newKey] = value;
      }
    },
    {}
  );
};
