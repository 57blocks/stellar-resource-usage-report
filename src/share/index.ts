import Table from 'tty-table';

import { STELLAR_LIMITS_CURSORS } from '@/types/enums';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const style = require('tty-table/src/style');

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
