import Table from 'tty-table';
import { ContractStore, MetricStatistics, ResourceMetricKeys, ResultStatistics } from 'stellar-resource-usage';

import { STELLAR_LIMITS_CURSORS } from '@/types/enums';
import { MetricKeys } from '@/constants';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const style = require('tty-table/src/style');

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

const loadTableData = (statistics: ResultStatistics) => {
  const res: (string | number)[][] = [];

  Object.entries(statistics).forEach(([contractName, funcs]) => {
    Object.entries(funcs).forEach(([funcName, data]) => {
      const times = data.times;
      MetricKeys.forEach((key) => {
        if (!data[key]) {
          return;
        }

        const { avg, max, min, sum } = data[key] as MetricStatistics;
        res.push([contractName, funcName, key, avg, max, min, sum, times]);
      });
    });
  });

  return res;
};

const printTableInfo = () => {
  const tableConfig: Table.Options = {
    borderStyle: 'dashed',
    color: 'green',
    borderColor: 'yellowBright',
  };

  console.log(
    Table(
      [
        [
          style.style(
            '===================================== Resource Usage Table =====================================',
            'cyanBright'
          ),
        ],
      ],
      {
        borderStyle: 'none',
        align: 'center',
      } as Table.Options
    ).render()
  );

  const rows = [
    [
      style.style(`Success ✅ : [0, ${STELLAR_LIMITS_CURSORS.WARNING * 100}%]`, 'bgGreen'),
      style.style(
        `Warning: (${STELLAR_LIMITS_CURSORS.WARNING * 100}%, ${STELLAR_LIMITS_CURSORS.DANGER * 100}%]`,
        'bgYellow'
      ),
      style.style(
        `Danger: (${STELLAR_LIMITS_CURSORS.DANGER * 100}%, ${STELLAR_LIMITS_CURSORS.ERROR * 100}%]`,
        'bgMagenta'
      ),
      style.style(`Error: (${STELLAR_LIMITS_CURSORS.ERROR * 100}%, ]`, 'bgRed'),
    ],
  ];

  const t3 = Table(rows, tableConfig);
  console.log(t3.render());
};

export const printTable = (rows: (string | number)[][]) => {
  printTableInfo();
  const tableConfig: Table.Options = {
    borderStyle: 'solid',
    color: 'green',
    borderColor: 'yellowBright',
    truncate: '...',
  };

  const headers: Table.Header[] = [
    { value: 'Resource', width: 25, headerColor: 'cyanBright', align: 'right' },
    { value: 'Usage', width: 25, headerColor: 'cyanBright' },
    { value: 'Limit', width: 25, headerColor: 'cyanBright' },
    {
      value: 'Result',
      width: 25,
      headerColor: 'cyanBright',
      formatter: (_cellValue, _columnIndex, rowIndex, rowData) => {
        const [_key, _value, _limit, _percent] = rowData[rowIndex];
        const percent = parseFloat(_percent);
        const isWarning = percent > STELLAR_LIMITS_CURSORS.WARNING * 100;
        const isDanger = percent > STELLAR_LIMITS_CURSORS.DANGER * 100;
        const isError = percent > STELLAR_LIMITS_CURSORS.ERROR * 100;

        if (isError) {
          return style.style(percent + '%', 'bgRed');
        } else if (isDanger) {
          return style.style(percent + '%', 'bgMagenta');
        } else if (isWarning) {
          return style.style(percent + '%', 'bgYellow');
        }
        return '✅';
      },
    },
  ];
  const t3 = Table(headers, rows, tableConfig);
  console.log(t3.render());
  return rows;
};

export const printTableV2 = (store: ContractStore) => {
  printTableInfo();

  const statistics = calcStatistics(store);
  const rows = loadTableData(statistics);

  const tableConfig: Table.Options = {
    borderStyle: 'solid',
    color: 'green',
    borderColor: 'yellowBright',
    truncate: '...',
  };

  const headers: Table.Header[] = [
    {
      value: 'Contract',
      width: 25,
      headerColor: 'cyanBright',
      align: 'right',
      // formatter: (cellValue, column, rowIndex, rowData) => {
      //   const [_func, _key, avg] = rowData[rowIndex];
      //   const percent = parseFloat(avg) / ;

      //   const isWarning = percent > STELLAR_LIMITS_CURSORS.WARNING * 100;
      //   const isDanger = percent > STELLAR_LIMITS_CURSORS.DANGER * 100;
      //   const isError = percent > STELLAR_LIMITS_CURSORS.ERROR * 100;

      //   if (isError) {
      //     return style.style(percent + '%', 'bgRed');
      //   } else if (isDanger) {
      //     return style.style(percent + '%', 'bgMagenta');
      //   } else if (isWarning) {
      //     return style.style(percent + '%', 'bgYellow');
      //   }
      // },
    },
    { value: 'Function', width: 25, headerColor: 'cyanBright' },
    { value: 'Resource', width: 25, headerColor: 'cyanBright' },
    { value: 'Avg', width: 25, headerColor: 'cyanBright' },
    { value: 'Max', width: 25, headerColor: 'cyanBright' },
    { value: 'Min', width: 25, headerColor: 'cyanBright' },
    { value: 'Total', width: 25, headerColor: 'cyanBright' },
    { value: 'Times', width: 25, headerColor: 'cyanBright' },
  ];

  const t3 = Table(headers, rows, tableConfig);
  console.log(t3.render());
  return rows;
};
