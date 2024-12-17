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
