import { getContract, keccak256, encodePacked } from "viem";
import { BribeMarketAbi, BribeVaultAbi } from "../config/abis";
import { configs } from "../config";
import { Network } from "../config/types";
import { getAllProposalIds } from "./proposals";

export const allowedTokens = (network: Network) => {
  const config = configs[network];
  return config.allowedTokens;
};

export const generateRewardIdentifier = (
  market: `0x${string}`,
  token: `0x${string}`,
  proposalDeadline: bigint
) => {
  return keccak256(
    encodePacked(
      ["address", "uint256", "address"],
      [market, proposalDeadline, token]
    )
  );
};

type IdentifierResults = {
  rewardIdentifier: `0x${string}`;
  bribeIdentifiers: `0x${string}`[];
}[];

const getIdentifiers = async (
  deadline: bigint,
  network: Network
): Promise<IdentifierResults> => {
  const config = configs[network];
  const tokens = allowedTokens(network);
  const potentialRewardIds = tokens.map((token) =>
    generateRewardIdentifier(
      config.contracts.regenerativeBribeMarket as `0x${string}`,
      token,
      deadline
    )
  );

  const results = await config.client.multicall({
    contracts: potentialRewardIds.map((identifier) => ({
      address: config.contracts.bribeVault as `0x${string}`,
      abi: BribeVaultAbi,
      functionName: "getBribeIdentifiersByRewardIdentifier",
      args: [identifier as `0x${string}`],
    })),
  });

  return potentialRewardIds
    .map((rewardId, index) => {
      const result = results[index];
      if (
        result.status === "success" &&
        Array.isArray(result.result) &&
        result.result.length > 0
      ) {
        return {
          rewardIdentifier: rewardId,
          bribeIdentifiers: result.result,
        };
      }
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
};

export const getRewardIdentifiers = async (
  deadline: bigint,
  network: Network
): Promise<`0x${string}`[]> => {
  const results = await getIdentifiers(deadline, network);
  return results.map((r) => r.rewardIdentifier);
};

export const getBribeIdentifiers = async (
  deadline: bigint,
  network: Network
): Promise<`0x${string}`[]> => {
  const results = await getIdentifiers(deadline, network);
  return results.flatMap((r) => r.bribeIdentifiers);
};

export const getBribes = async (
  bribeIdentifiers: `0x${string}`[],
  network: Network
) => {
  const config = configs[network];

  const results = await config.client.multicall({
    contracts: bribeIdentifiers.map((identifier) => ({
      address: config.contracts.bribeVault as `0x${string}`,
      abi: BribeVaultAbi,
      functionName: "getBribe",
      args: [identifier],
    })),
  });

  const proposalGaugesMap = await getAllProposalIds(network);

  return results
    .filter(
      (result) =>
        result.status === "success" &&
        Array.isArray(result.result) &&
        result.result.length > 0
    )
    .map((result) => {
      // We know result.result exists and is an array from the filter
      const [token, amount, proposal] = result.result as unknown as [
        `0x${string}`,
        bigint,
        `0x${string}`
      ];
      return {
        token,
        amount,
        proposal,
        gauge: proposalGaugesMap[proposal],
      };
    });
};
