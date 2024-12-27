import { type ClientOptions } from '@stellar/stellar-sdk/contract';

import { printTable } from '@/share';
import { anyObj, CalcResourceProps } from '@/types/interface';
import { STELLAR_LIMITS_CONFIG } from '@/constants';
import { getStats, handleTxToGetStatsV2 } from '@/tasks';

const calcResource = async (props: CalcResourceProps) => {
  const stats = (await getStats(props)) as anyObj;
  const res: (string | number)[][] = [];

  Object.entries(stats).forEach(([key, value]) => {
    const limit = STELLAR_LIMITS_CONFIG[key as 'cpu_insns'];
    const percent = parseFloat(((value / limit.value) * 100).toFixed(2));
    res.push([key, value, limit.lable, percent]);
  });

  printTable(res);

  // For testing purposes
  return true;
};

export function ResourceUsageClient(Client: any, options: ClientOptions) {
  class ResourceUsage extends Client {
    constructor() {
      super(options);
      const contractFunNames = this.spec.funcs().map((fun: any) => fun.name().toString());
      for (const funName of contractFunNames) {
        const originalFun = this[funName];
        this[funName] = async (...args: any) => {
          try {
            const assembledTx = await originalFun(...args);
            const res = await assembledTx.signAndSend();
            const stats = (await handleTxToGetStatsV2(assembledTx as any, res.getTransactionResponse as any)) as anyObj;

            const lis: (string | number)[][] = [];

            Object.entries(stats).forEach(([key, value]) => {
              const limit = STELLAR_LIMITS_CONFIG[key as 'cpu_insns'];
              const percent = parseFloat(((value / limit.value) * 100).toFixed(2));
              lis.push([key, value, limit.lable, percent]);
            });

            printTable(lis);
            return assembledTx;
          } catch (error) {
            console.error(error);
          }
        };
      }
    }
  }
  return new ResourceUsage();
}

export default calcResource;
