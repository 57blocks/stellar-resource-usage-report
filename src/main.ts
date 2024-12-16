import { rpc } from '@stellar/stellar-sdk';

import { printTable } from '@/share';
import { anyObj } from '@/types';
import { STELLAR_LIMITS_CONFIG } from '@/types/constants';
import { getStatsFromTx, getStatsFromTxRes } from '@/tasks';

const calcResource = (
  simRes: rpc.Api.SimulateTransactionSuccessResponse,
  tx?: rpc.Api.GetSuccessfulTransactionResponse
) => {
  const stats_txRes = getStatsFromTxRes(simRes);
  const stats_tx = getStatsFromTx(tx);

  const stats = {
    ...stats_txRes,
    ...stats_tx,
  } as anyObj;

  const res: (string | number)[][] = [];

  Object.entries(stats).forEach(([key, value]) => {
    const limit = STELLAR_LIMITS_CONFIG[key as 'cpu_insns'];
    const isExceeded = limit ? value > limit : false;
    const isTaken80 = limit ? value > limit * 0.8 : false;
    res.push([
      key,
      value,
      limit,
      isTaken80 ? `ℹ️ (used ${((value / limit) * 100).toFixed(2)} %)` : isExceeded ? '❌' : '✅',
    ]);
  });

  printTable(res);

  // For testing purposes
  return true;
};

export default calcResource;
