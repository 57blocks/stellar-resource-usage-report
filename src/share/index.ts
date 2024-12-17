import Table from 'tty-table';

const style = require('tty-table/src/style');

export const printTable = (rows: any[]) => {
  const tableConfig: Table.Options = {
    borderStyle: 'solid',
    color: 'green',
    borderColor: 'yellowBright',
    truncate: '...',
  };

  const headers: Table.Header[] = [
    { value: 'Resource', width: 30, headerColor: 'cyanBright', align: 'right', alias: 'Resource' },
    { value: 'Usage', width: 30, headerColor: 'cyanBright', alias: 'Usage (byte)' },
    { value: 'Limit', width: 30, headerColor: 'cyanBright', alias: 'Limit (byte)' },
    {
      value: 'Result',
      width: 30,
      headerColor: 'cyanBright',
      formatter: (_cellValue, _columnIndex, rowIndex, rowData) => {
        const [_key, value, limit] = rowData[rowIndex];
        const percent = parseFloat(((value / limit) * 100).toFixed(2));
        const isExceeded = percent > 100;
        const isTaken80 = percent > 80;
        if (isExceeded) {
          return style.style(percent + '%', 'bgRed', 'white');
        } else if (isTaken80) {
          return style.style(percent + '%', 'bgYellow', 'white');
        }
        return '✅';
      },
    },
  ];
  const t3 = Table(headers, rows, tableConfig);
  console.log(t3.render());
  return rows;
};
