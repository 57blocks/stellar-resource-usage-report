import { Network, Color } from '@/types/enums';
import { printTerminalMessage } from '@/share';

export const test = (network: Network) => {
  printTerminalMessage(network, Color.GREEN);
  return network;
};
