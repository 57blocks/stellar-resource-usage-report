import Table from 'tty-table';

export const printTable = (rows: any[]) => {
  const tableConfig: Table.Options = {
    borderStyle: 'solid',
    color: 'green',
    borderColor: 'white',
    truncate: '...',
  };

  const headers: Table.Header[] = [
    { value: 'Resource', width: 40, headerColor: 'blue' },
    { value: 'Usage', width: 40, headerColor: 'blue' },
    { value: 'Limit', width: 40, headerColor: 'blue' },
    { value: 'Result', width: 40, headerColor: 'blue' },
  ];
  const t3 = Table(headers, rows, tableConfig);
  console.log(t3.render());
  return rows;
};
