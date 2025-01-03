import { type ClientOptions } from '@stellar/stellar-sdk/contract';
import {
  rpc,
  Keypair,
  Account,
  TransactionBuilder,
  Transaction,
  Operation,
  OperationOptions,
} from '@stellar/stellar-sdk';
import { ContractStore, ResourceUsageClientInstance } from 'stellar-resource-usage';

import { printTableV2 } from '@/share';
import { anyObj } from '@/types/interface';
import { getStats, handleTxToGetStatsV2 } from '@/tasks';
import { updateTxLimits } from './utils/utils';

interface ServerInfo {
  networkPassphrase: string;
  secretKey: string;
  rpcUrl: string;
}

export function ResourceServer(info: ServerInfo) {
  class ResourceServer {
    info: ServerInfo;
    rpcServer: rpc.Server;
    keypair: Keypair;
    storedStatus: ContractStore = {};
    sourceAccount: Account | undefined = undefined;

    constructor(info: ServerInfo) {
      this.info = info;
      this.keypair = Keypair.fromSecret(info.secretKey);
      this.rpcServer = new rpc.Server(info.rpcUrl, { allowHttp: true });
    }

    async getAccount(): Promise<Account> {
      const publicKey = this.keypair.publicKey();
      const sourceAccount = await this.rpcServer
        .getAccount(publicKey)
        .then((account) => new Account(account.accountId(), account.sequenceNumber()))
        .catch(() => {
          throw new Error(`Issue with ${publicKey} account.`);
        });
      this.sourceAccount = sourceAccount;
      return sourceAccount;
    }

    async buildTransaction(optsOfOperations: OperationOptions.InvokeContractFunction[]): Promise<Transaction> {
      const sourceAccount = await this.getAccount();
      let txBuilder = new TransactionBuilder(sourceAccount, {
        fee: '0',
        networkPassphrase: this.info.networkPassphrase,
      });

      optsOfOperations.forEach((opts) => {
        txBuilder = txBuilder.addOperation(Operation.invokeContractFunction(opts));
      });

      return txBuilder.setTimeout(0).build();
    }

    async calcResourceForTx(optsOfOperations: OperationOptions.InvokeContractFunction[]) {
      await updateTxLimits();
      const tx = await this.buildTransaction(optsOfOperations);
      const stats = (await getStats({ tx, keypair: this.keypair, rpcServer: this.rpcServer })) as anyObj;
      tx.operations.forEach((op, index) => {
        const contractId: string = optsOfOperations[index].contract;
        const funcName: string = (op as any).func.invokeContract().functionName();

        if (!this.storedStatus[contractId]) {
          this.storedStatus[contractId] = {};
        }
        if (!this.storedStatus[contractId][funcName]) {
          this.storedStatus[contractId][funcName] = [stats];
        } else {
          this.storedStatus[contractId][funcName].push(stats);
        }
      });

      Object.entries(this.storedStatus).forEach(([contractId]) => {
        this.printTable(contractId);
      });
    }

    printTable(contractId: string) {
      const storeData = this.storedStatus;
      printTableV2(contractId, storeData);
    }
  }

  return new ResourceServer(info);
}

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
