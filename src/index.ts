import { Network } from "@/enums";
import { log } from "@/share";

export const test = (network: Network) => {
  log(network);
  return network;
};
