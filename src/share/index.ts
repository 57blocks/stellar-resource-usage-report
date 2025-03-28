import CliTable3 from 'cli-table3';
import Colors from '@colors/colors';
import { ContractStore, MetricStatistics, ResourceMetricKeys, ResultStatistics } from '@57block/stellar-resource-usage';

import { STELLAR_LIMITS_CURSORS } from '@/types/enums';
import { MetricKeys, STELLAR_LIMITS_CONFIG } from '@/constants';

const calcStatistics = (store: ContractStore) => {
  const res: any = {};
  const metricKeys: ResourceMetricKeys[] = [
    'cpu_insns',
    'mem_bytes',
    'entry_bytes',
    'entry_reads',
    'entry_writes',
    'read_bytes',
    'write_bytes',
    'min_txn_bytes',
  ];

  Object.entries(store).forEach(([contractName, funcs]) => {
    res[contractName] = {};
    Object.entries(funcs).forEach(([funcName, data]) => {
      const times = data.length;

      metricKeys.forEach((key) => {
        if (!data[0][key]) {
          return;
        }

        let sum = 0;
        let max = data[0][key];
        let min = data[0][key];

        data.forEach((metric) => {
          const value = metric[key] || 0;
          sum += value;
          if (value > max) {
            max = value;
          }
          if (value < min) {
            min = value;
          }
        });

        const avg = sum / times;

        if (!res[contractName]) {
          res[contractName] = {};
        }
        if (!res[contractName][funcName]) {
          res[contractName][funcName] = {};
        }

        res[contractName][funcName][key] = { avg, max, min, sum };
      });

      res[contractName][funcName].times = times;
    });
  });

  return res;
};

export const loadTableDataV2 = (statistics: ResultStatistics) => {
  const res: {
    func: string;
    times: number;
    data: (string | number)[][];
  }[] = [];
  Object.entries(statistics).forEach(([_, funcs]) => {
    Object.entries(funcs).forEach(([func, data]) => {
      const times = data.times;
      const trData: (string | number)[][] = [];
      MetricKeys.forEach((key) => {
        if (!data[key]) {
          return;
        }
        const { avg, max, min, sum } = data[key] as MetricStatistics;
        const limitation = STELLAR_LIMITS_CONFIG[key as keyof typeof STELLAR_LIMITS_CONFIG].value;
        trData.push([key, limitation, avg, max, min, sum]);
      });
      res.push({
        func,
        times,
        data: trData,
      });
    });
  });

  return res;
};

export const printTableV2 = (contractId: string, store: ContractStore) => {
  // printTableInfo();
  const cliTable = new CliTable3({
    style: { head: [], border: [] },
  });
  cliTable.push([
    {
      colSpan: 6,
      content: Colors.brightCyan.bold('Resource Usage Table'),
      hAlign: 'center',
    },
  ]);
  const labelTr = [
    { content: Colors.brightCyan.bold('Highligh Color'), colSpan: 2 },
    {
      content: Colors.brightYellow.bold(
        `Warning: ${STELLAR_LIMITS_CURSORS.DANGER * 100}% - ${STELLAR_LIMITS_CURSORS.ERROR * 100}%`
      ),
      colSpan: 2,
    },
    { content: Colors.brightRed.bold(`Error: Over ${STELLAR_LIMITS_CURSORS.ERROR * 100}%`), colSpan: 2 },
  ];
  const contractTr = [
    { content: Colors.brightCyan.bold('Contract'), colSpan: 2 },
    { content: contractId, colSpan: 4 },
  ];
  cliTable.push(labelTr);
  cliTable.push(contractTr);
  const statistics = calcStatistics(store);
  const res = loadTableDataV2(statistics);
  res.forEach(({ func, times, data }) => {
    const funcTr = [
      Colors.brightCyan.bold('Function'),
      {
        content: func,
        colSpan: 2,
      },
      Colors.brightCyan.bold('Times'),
      {
        content: times,
        colSpan: 2,
      },
    ];
    cliTable.push(funcTr);
    const functionTableHead = ['Resource', 'Limitation', 'Avg', 'Max', 'Min', 'Sum'].map((item) =>
      Colors.brightCyan.bold(item)
    );
    cliTable.push(functionTableHead);
    data.forEach(([key, limitation, avg, max, min, sum]) => {
      const average = formatTableCell(avg, limitation);
      const maximum = formatTableCell(max, limitation);
      const minimum = formatTableCell(min, limitation);
      cliTable.push([Colors.brightCyan.bold(key as string), limitation, average, maximum, minimum, sum]);
    });
  });
  console.log(cliTable.toString());
};

const formatTableCell = (cellValue: string | number, limit: string | number) => {
  // calculate the percentage
  const percent = parseFloat(((Number(cellValue) / Number(limit)) * 100).toFixed(2));
  // set the color based on the percentage
  const isDanger = percent > STELLAR_LIMITS_CURSORS.DANGER * 100;
  const isError = percent > STELLAR_LIMITS_CURSORS.ERROR * 100;

  if (isError) {
    return Colors.brightRed.bold(cellValue.toString());
  }
  if (isDanger) {
    return Colors.brightYellow.bold(cellValue.toString());
  }
  return cellValue;
};
