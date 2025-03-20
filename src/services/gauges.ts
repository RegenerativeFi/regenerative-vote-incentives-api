import { Network } from "../config/types";
import { configs } from "../config";

export const getRegisteredGauges = async (network: Network) => {
  return (
    configs[network].gauges?.map((gauge) => gauge.address as `0x${string}`) ??
    []
  );
};

export const getGaugeLPToken = async (
  gaugeAddress: `0x${string}`,
  network: Network
) => {
  const gauge = configs[network].gauges?.find(
    (g) => g.address.toLowerCase() === gaugeAddress.toLowerCase()
  );
  return (gauge?.lpToken ?? "") as `0x${string}`;
};

export const getGaugesLPToken = async (
  gaugeAddresses: `0x${string}`[],
  network: Network
) => {
  return gaugeAddresses.map((gaugeAddress) => {
    const gauge = configs[network].gauges?.find(
      (g) => g.address.toLowerCase() === gaugeAddress.toLowerCase()
    );
    return (gauge?.lpToken ?? "") as `0x${string}`;
  });
};
