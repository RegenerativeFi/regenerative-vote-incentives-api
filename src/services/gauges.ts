import { getContract } from "viem";
import { GaugeRegistryAbi, RewardsOnlyGaugeAbi } from "../config/abis";
import { configs } from "../config";
import { Network } from "../config/types";

export const getRegisteredGauges = async (network: Network) => {
  const registry = getContract({
    address: configs[network].contracts.gaugeRegistry as `0x${string}`,
    abi: GaugeRegistryAbi,
    client: configs[network].client,
  });

  try {
    // Get number of gauges

    const count = await registry.read.totalGauges();
    // Get gauges
    const gauges = await registry.read.getGauges([BigInt(0), BigInt(count)]);
    return gauges;
  } catch (error) {
    console.error("Error getting gauges", error);
    return [];
  }
};

export const getGaugeLPToken = async (
  gaugeAddress: `0x${string}`,
  network: Network
) => {
  const gauge = getContract({
    address: gaugeAddress,
    abi: RewardsOnlyGaugeAbi,
    client: configs[network].client,
  });

  const lpToken = await gauge.read.lp_token();

  return lpToken;
};

export const getGaugesLPToken = async (
  gaugeAddresses: `0x${string}`[],
  network: Network
) => {
  const gauges = await Promise.all(
    gaugeAddresses.map(async (gaugeAddress) => {
      return getGaugeLPToken(gaugeAddress, network);
    })
  );

  return gauges;
};
