import { printTable } from '@/share';

/**
 * Print a message to the terminal (use chalk to color the message)
 * @param message message to print
 */
const calcResource = (message: string) => {
  const tableData = {
    cpu_insns: 132918280,
    mem_bytes: 48017296,
    entry_reads: 43,
    entry_writes: 21,
    read_bytes: 212012,
    write_bytes: 68452,
    events_and_return_bytes: 8272,
    min_txn_bytes: 76132,
    max_entry_bytes: 66920,
    max_key_bytes: 352,
  };

  printTable(['Stellar Resource Usage', message], Object.entries(tableData));

  return message;
};

export default calcResource;
