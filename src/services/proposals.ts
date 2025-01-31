import { encodeFunctionData, encodePacked, getContract, keccak256 } from "viem";
import { BribeMarketAbi } from "../config/abis";
import { configs } from "../config";
import { Network } from "../config/types";
import { getRegisteredGauges } from "./gauges";

export const setProposalsData = (gauges: `0x${string}`[], deadline: bigint) => {
  const proposalData = encodeFunctionData({
    abi: BribeMarketAbi,
    functionName: "setProposalsByAddress",
    args: [gauges, deadline],
  });

  return proposalData;
};

export const filterAlreadySetProposals = async (
  proposals: `0x${string}`[],
  deadline: bigint,
  network: Network
) => {
  const client = configs[network].client;

  const bribeMarket = getContract({
    address: configs[network].contracts.regenerativeBribeMarket,
    abi: BribeMarketAbi,
    client: client,
  });

  const results = [];
  for (const proposal of proposals) {
    const proposalData = await bribeMarket.read.proposalDeadlines([
      keccak256(encodePacked(["address"], [proposal])),
    ]);
    if (proposalData !== deadline) {
      results.push(proposal);
    }
  }

  return results;
};

export const getAllProposalIds = async (network: Network) => {
  const gauges = await getRegisteredGauges(network);
  return gauges.reduce((acc, gauge) => {
    const proposalId = keccak256(encodePacked(["address"], [gauge]));
    acc[proposalId] = gauge;
    return acc;
  }, {} as Record<`0x${string}`, `0x${string}`>);
};

// export const setProposals = async (
//   gauges: `0x${string}`[],
//   deadline: bigint,
//   network: Network
// ) => {
//   const proposalData = await setProposalsData(gauges, deadline);

//   const wallet = configs[network].wallet;

//   const tx = await wallet.sendTransaction({
//     to: configs[network].contracts.regenerativeBribeMarket as `0x${string}`,
//     data: proposalData,
//     account: null,
//     chain: undefined
//   });

//   return tx;
// };
