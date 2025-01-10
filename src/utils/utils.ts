import { transform, isObject, isArray } from 'lodash-es';

import { STELLAR_LIMITS_CONFIG, UPDATE_STELLAR_LIMITS_CONFIG } from '../constants';
import { getProtocolHistory } from '@/api/stellar';

// This time corresponds to the value in the STELLAR_LIMITS_CONFIG
let TIMESTAMP = 1735537317419;

export const updateTxLimits = async () => {
  if (Date.now() - TIMESTAMP < 60 * 60 * 1000) return;
  TIMESTAMP = Date.now();

  try {
    const data = await getProtocolHistory();
    const flattenData = data.map((history: any) => {
      return filterObject(history.config_changes, ['contractCompute', 'contractLedgerCost', 'contractBandwidth']);
    });
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
      min_txn_bytes: {
        ...STELLAR_LIMITS_CONFIG.min_txn_bytes,
        value: contractLimitData.contractBandwidth.txMaxSizeBytes ?? STELLAR_LIMITS_CONFIG.min_txn_bytes.value,
      },
    };
    UPDATE_STELLAR_LIMITS_CONFIG(txLimits);
  } catch (error) {
    console.log(error);
  }
};

export function filterObject(obj: object, keys: string[]) {
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    const filteredObj: Record<string, any> = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (keys.includes(key)) {
        filteredObj[key] = value;
      }
    });
    return filteredObj;
  }
}

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

/**
 * Keep calling a `fn` for `timeoutInSeconds` seconds, if `keepWaitingIf` is
 * true. Returns an array of all attempts to call the function.
 * @private
 */
export async function withExponentialBackoff<T>(
  /** Function to call repeatedly */
  fn: (previousFailure?: T) => Promise<T>,
  /** Condition to check when deciding whether or not to call `fn` again */
  keepWaitingIf: (result: T) => boolean,
  /** Maximum total duration in seconds for all retry attempts  */
  timeoutInSeconds: number,
  /** What to multiply `timeoutInSeconds` by, each subsequent attempt */
  exponentialFactor = 1.5,
  /** Whether to log extra info */
  verbose = false
): Promise<T[]> {
  const attempts: T[] = [];

  let count = 0;
  attempts.push(await fn());
  if (!keepWaitingIf(attempts[attempts.length - 1])) return attempts;

  const waitUntil = new Date(Date.now() + timeoutInSeconds * 1000).valueOf();
  let waitTime = 1000;
  let totalWaitTime = waitTime;

  while (Date.now() < waitUntil && keepWaitingIf(attempts[attempts.length - 1])) {
    count += 1;
    // Wait a beat
    if (verbose) {
      console.info(
        `Waiting ${waitTime}ms before trying again (bringing the total wait time to ${totalWaitTime}ms so far, of total ${timeoutInSeconds * 1000}ms)`
      );
    }

    await new Promise((res) => setTimeout(res, waitTime));
    // Exponential backoff
    waitTime *= exponentialFactor;
    if (new Date(Date.now() + waitTime).valueOf() > waitUntil) {
      waitTime = waitUntil - Date.now();
      if (verbose) {
        console.info(`was gonna wait too long; new waitTime: ${waitTime}ms`);
      }
    }
    totalWaitTime = waitTime + totalWaitTime;
    // Try again

    attempts.push(await fn(attempts[attempts.length - 1]));
    if (verbose && keepWaitingIf(attempts[attempts.length - 1])) {
      console.info(
        `${count}. Called ${fn}; ${attempts.length} prev attempts. Most recent: ${JSON.stringify(
          attempts[attempts.length - 1],
          null,
          2
        )}`
      );
    }
  }

  return attempts;
}
