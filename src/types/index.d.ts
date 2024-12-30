declare module 'stellar-resource-usage' {
  import { Keypair, Transaction, rpc } from '@stellar/stellar-sdk';

  export interface anyObj {
    [key: string]: any;
  }

  export interface TXResourceUsageStats {
    mem_bytes: number;
    entry_reads: number;
    entry_writes: number;
    read_bytes: number;
    write_bytes: number;
    max_key_bytes?: number;
  }

  export interface CalcResourceProps {
    tx: Transaction;
    rpcServer: rpc.Server;
    keypair: Keypair;
    resourceFee?: number;
  }

  export interface UsageStoreType {
    [key: string]: {
      [key: sting]: {
        [key: string]: number;
      }[];
    };
  }
  export interface ResourceMetric {
    cpu_insns?: number;
    mem_bytes?: number;
    entry_bytes?: number;
    entry_reads?: number;
    entry_writes?: number;
    read_bytes?: number;
    write_bytes?: number;
    min_txn_bytes?: number;
  }
  export type ResourceMetricKeys = keyof ResourceMetric;
  export type FunctionStore = Record<string, ResourceMetric[]>;
  export type ContractStore = Record<string, FunctionStore>;

  export interface MetricStatistics {
    avg: number;
    max: number;
    min: number;
    sum: number;
  }

  export interface FunctionStatistics {
    [key: string]: MetricStatistics | number;
    times: number;
  }

  export interface ContractStatistics {
    [funcName: string]: FunctionStatistics;
  }

  export interface ResultStatistics {
    [contractName: string]: ContractStatistics;
  }

  export const STELLAR_LIMITS_CONFIG: TXResourceUsageStats;

  export function printTable(rows: any[]): any[];

  export function getStats(props: CalcResourceProps): Promise<anyObj>;

  export default function calcResource(props: CalcResourceProps): Promise<boolean>;
}
