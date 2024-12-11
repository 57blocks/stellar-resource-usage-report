import { printTable } from '@/share';
import { anyObj } from '@/types';

/**
 * Print a message to the terminal (use chalk to color the message)
 * @param message message to print
 */
const calcResource = (data: anyObj | string[][]) => {
  const tableData = Array.isArray(data) ? data : Object.entries(data);
  printTable(tableData);

  return data;
};

export default calcResource;
