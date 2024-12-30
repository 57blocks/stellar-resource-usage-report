declare module 'tty-table/src/style' {
  export function style(str: string, bgRed: string, white: string): string;
}

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

  export const STELLAR_LIMITS_CONFIG: TXResourceUsageStats;

  export function printTable(rows: any[]): any[];

  export function getStats(props: CalcResourceProps): Promise<anyObj>;

  export function calcResource(props: CalcResourceProps): Promise<boolean>;
}
