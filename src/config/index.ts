import { alfajores } from "./networks/alfajores";
import { Network, NetworkConfig } from "./types";

export const configs: Record<Network, NetworkConfig> = {
  [Network.ALFAJORES]: alfajores,
  [Network.CELO]: alfajores, // Added missing CELO network config
};
