import { rpc, Transaction, FeeBumpTransaction, StrKey } from '@stellar/stellar-sdk';
import { AssembledTransaction, type ClientOptions } from '@stellar/stellar-sdk/contract';
import { ContractStore, ResourceUsageClientInstance } from '@57block/stellar-resource-usage';

import { printTableV2 } from '@/share';
import { handleTxToGetStats } from '@/tasks';
import { updateTxLimits, withExponentialBackoff } from './utils/utils';
import { STELLAR_LIMITS_CONFIG } from './constants';

interface HashMapValue {
  sendTxRes: rpc.Api.SendTransactionResponse;
  transaction: Transaction | FeeBumpTransaction | undefined;
  simTxRes: rpc.Api.SimulateTransactionResponse | undefined;
}
export class StellarRpcServer extends rpc.Server {
  #hash: Map<string, HashMapValue> = new Map();
  transaction: Transaction | FeeBumpTransaction | undefined;
  simTxRes: rpc.Api.SimulateTransactionResponse | undefined;
  storedStats: ContractStore = {};
  constructor(serverURL: string, opts?: rpc.Server.Options) {
    super(serverURL, opts);
  }

  public async printTable(): Promise<void> {
    const txPromises = Array.from(this.#hash).map(([hash]) => {
      return withExponentialBackoff<rpc.Api.GetTransactionResponse>(
        () => super.getTransaction(hash),
        (resp) => resp.status === rpc.Api.GetTransactionStatus.NOT_FOUND,
        10
      );
    });
    try {
      const allData = await Promise.all(txPromises);
      allData.forEach((data) => {
        const successDatum = data.find((response) => response.status === rpc.Api.GetTransactionStatus.SUCCESS);
        if (successDatum) {
          const { simTxRes, transaction } = this.#hash.get(successDatum.txHash)!;
          const stats = handleTxToGetStats(simTxRes as rpc.Api.SimulateTransactionSuccessResponse, successDatum);
          this.storeTransactionStats(transaction as Transaction, stats);
        } else {
          console.log('Failed to get transaction');
        }
      });
    } catch (error) {
      console.log('Failed to get transactions', error);
    }

    Object.keys(this.storedStats).forEach((contractId) => {
      printTableV2(contractId, this.storedStats);
    });
    this.#hash.clear();
    this.storedStats = {};
  }

  public async simulateTransaction(
    tx: Transaction | FeeBumpTransaction,
    resourceLeeway?: rpc.Server.ResourceLeeway
  ): Promise<rpc.Api.SimulateTransactionResponse> {
    const simTxResponse = await super.simulateTransaction(tx, resourceLeeway);
    this.transaction = tx;
    this.simTxRes = simTxResponse;
    return simTxResponse;
  }

  public async sendTransaction(
    transaction: Transaction | FeeBumpTransaction
  ): Promise<rpc.Api.SendTransactionResponse> {
    const sendTxRes = await super.sendTransaction(transaction);
    this.#hash.set(sendTxRes.hash, { sendTxRes, transaction: this.transaction, simTxRes: this.simTxRes });
    this.transaction = undefined;
    this.simTxRes = undefined;
    return sendTxRes;
  }

  public storeTransactionStats(
    tx: Transaction | FeeBumpTransaction,
    stats: Record<keyof typeof STELLAR_LIMITS_CONFIG, number | undefined>
  ) {
    tx.operations.forEach((operation) => {
      // A tx can only perform 1 invokeHostFunction operation at most.
      if (operation.type === 'invokeHostFunction') {
        const contractId: string = StrKey.encodeContract(
          (operation as any).func.invokeContract().contractAddress().value()
        );
        const funcName: string = (operation as any).func.invokeContract().functionName();

        if (!this.storedStats[contractId]) {
          this.storedStats[contractId] = {};
        }
        if (!this.storedStats[contractId][funcName]) {
          this.storedStats[contractId][funcName] = [stats];
        } else {
          this.storedStats[contractId][funcName].push(stats);
        }
      }
    });
  }
}

const CONSTRUCTOR_FUNC = '__constructor';

export async function ResourceUsageClient<T>(Client: any, options: ClientOptions) {
  await updateTxLimits();
  class ResourceUsage extends Client {
    contractId: string;
    storedStats: ContractStore = {};
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
        this[funName] = async (...args: any): Promise<AssembledTransaction<any>> => {
          try {
            const assembledTx = await originalFun(...args);
            return {
              ...assembledTx,
              signAndSend: async () => {
                const res = await assembledTx.signAndSend();
                const stats = handleTxToGetStats(assembledTx as any, res.getTransactionResponse as any);
                if (!this.storedStats[this.contractId]) {
                  // init object
                  this.storedStats[this.contractId] = {};
                }
                if (!this.storedStats[this.contractId][funName]) {
                  // init array
                  this.storedStats[this.contractId][funName] = [stats];
                } else {
                  this.storedStats[this.contractId][funName].push(stats);
                }
                return res;
              },
            };
          } catch (error) {
            console.error(error);
            throw error;
          }
        };
      }
      this.contractId = options.contractId;
    }
    printTable() {
      const storeData = this.storedStats;
      printTableV2(this.contractId, storeData);
    }
  }
  return new ResourceUsage() as unknown as T & ResourceUsageClientInstance;
}
