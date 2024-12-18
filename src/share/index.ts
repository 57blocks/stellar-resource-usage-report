import Table from 'tty-table';

import { STELLAR_LIMITS_CURSORS } from '@/types/enums';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const style = require('tty-table/src/style');

export const printTable = (rows: (string | number)[][]) => {
  const tableConfig: Table.Options = {
    borderStyle: 'solid',
    color: 'green',
    borderColor: 'yellowBright',
    truncate: '...',
  };

  const headers: Table.Header[] = [
    { value: 'Resource', width: 35, headerColor: 'cyanBright', align: 'right', alias: 'Resource' },
    { value: 'Usage', width: 35, headerColor: 'cyanBright', alias: 'Usage (byte)' },
    { value: 'Limit', width: 40, headerColor: 'cyanBright', alias: 'Limit (byte)' },
    {
      value: 'Result',
      width: 30,
      headerColor: 'cyanBright',
      formatter: (_cellValue, _columnIndex, rowIndex, rowData) => {
        const [_key, _value, _limit, _percent] = rowData[rowIndex];
        const percent = parseFloat(_percent);
        console.log('percent', rowData[rowIndex]);
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
