import { alfajores } from "./networks/alfajores";
import { celo } from "./networks/celo";
import { Network, NetworkConfig } from "./types";

export const configs: Record<Network, NetworkConfig> = {
  [Network.ALFAJORES]: alfajores,
  [Network.CELO]: celo,
};
