import { type ClientOptions } from '@stellar/stellar-sdk/contract';
import { ContractStore, ResourceUsageClientInstance } from 'stellar-resource-usage';

import { printTableV2 } from '@/share';
import { handleTxToGetStatsV2 } from '@/tasks';
import { updateTxLimits } from './utils/utils';

const CONSTRUCTOR_FUNC = '__constructor';

export async function ResourceUsageClient<T>(Client: any, options: ClientOptions) {
  await updateTxLimits();
  class ResourceUsage extends Client {
    contractId: string;
    storedStatus: ContractStore = {};
    constructor() {
      if (!options.contractId) {
        throw new Error('contractId is required');
      }
      super(options);
      this.contractId = options.contractId;
      const contractFunNames = this.spec.funcs().map((fun: any) => fun.name().toString());
      for (const funName of contractFunNames) {
        const originalFun = this[funName];
        if (funName === CONSTRUCTOR_FUNC) {
          return;
        }
        this[funName] = async (...args: any) => {
          try {
            const assembledTx = await originalFun(...args);
            const res = await assembledTx.signAndSend();
            const stats = await handleTxToGetStatsV2(assembledTx as any, res.getTransactionResponse as any);
            if (!this.storedStatus[this.contractId]) {
              // init object
              this.storedStatus[this.contractId] = {};
            }
            if (!this.storedStatus[this.contractId][funName]) {
              // init array
              this.storedStatus[this.contractId][funName] = [stats];
            } else {
              this.storedStatus[this.contractId][funName].push(stats);
            }
            return assembledTx;
          } catch (error) {
            console.error(error);
          }
        };
      }
      this.contractId = options.contractId;
    }
    printTable() {
      const storeData = this.storedStatus;
      printTableV2(this.contractId, storeData);
    }
  }
  return new ResourceUsage() as unknown as T & ResourceUsageClientInstance;
}
