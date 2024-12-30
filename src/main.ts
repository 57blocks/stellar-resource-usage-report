import { type ClientOptions } from '@stellar/stellar-sdk/contract';

import { printTable } from '@/share';
import { anyObj, CalcResourceProps } from '@/types/interface';
import { STELLAR_LIMITS_CONFIG } from '@/constants';
import { getStats, handleTxToGetStatsV2 } from '@/tasks';
import { updateTxLimits } from './utils/utils';

export interface ResourceUsageClient {
  contractId: string;
  storedStatus: {
    [functionName: string]: any[];
  };
  printTable(): void;
}

export const calcResource = async (props: CalcResourceProps) => {
  await updateTxLimits();
  const stats = (await getStats(props)) as anyObj;
  const res: (string | number)[][] = [];

  Object.entries(stats).forEach(([key, value]) => {
    const limit = STELLAR_LIMITS_CONFIG[key as 'cpu_insns'];
    const percent = parseFloat(((value / limit.value) * 100).toFixed(2));
    res.push([key, value, limit.label, percent]);
  });

  printTable(res);

  // For testing purposes
  return true;
};

export async function ResourceUsageClient<T>(Client: any, options: ClientOptions) {
  await updateTxLimits();
  class ResourceUsage extends Client {
    contractId: string;
    storedStatus: {
      [functionName: string]: any[];
    } = {};
    constructor() {
      if (!options.contractId) {
        throw new Error('contractId is required');
      }
      super(options);
      const contractFunNames = this.spec.funcs().map((fun: any) => fun.name().toString());
      for (const funName of contractFunNames) {
        const originalFun = this[funName];
        this[funName] = async (...args: any) => {
          try {
            const assembledTx = await originalFun(...args);
            const res = await assembledTx.signAndSend();
            const stats = (await handleTxToGetStatsV2(assembledTx as any, res.getTransactionResponse as any)) as anyObj;
            if (!this.storedStatus[funName]) {
              // init array
              this.storedStatus[funName] = [stats];
            } else {
              this.storedStatus[funName].push(stats);
            }
            // const lis: (string | number)[][] = [];

            // Object.entries(stats).forEach(([key, value]) => {
            //   const limit = STELLAR_LIMITS_CONFIG[key as 'cpu_insns'];
            //   const percent = parseFloat(((value / limit.value) * 100).toFixed(2));
            //   lis.push([key, value, limit.label, percent]);
            // });

            // printTable(lis);
            return assembledTx;
          } catch (error) {
            console.error(error);
          }
        };
      }
      this.contractId = options.contractId;
    }
    printTable() {
      console.log(this.storedStatus);
    }
  }
  return new ResourceUsage() as unknown as T & ResourceUsageClient;
}
