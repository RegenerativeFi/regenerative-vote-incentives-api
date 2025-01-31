import { PublicClient, WalletClient } from "viem";

export enum Network {
  CELO = "Celo",
  ALFAJORES = "Alfajores",
}

export type NetworkConfig = {
  name: Network;
  client: PublicClient;
  wallet: WalletClient;
  proposalDuration: number;
  proposalStartTime: number;
  cronJobs: Record<string, { cron: string }>;
  contracts: Contracts;
};

export type Contracts = {
  gaugeRegistry: `0x${string}`;
  gaugeController: `0x${string}`;
  bribeVault: `0x${string}`;
  protocolFeesCollector: `0x${string}`;
  regenerativeBribeMarket: `0x${string}`;
  rewardDistributor: `0x${string}`;
  votingEscrow: `0x${string}`;
};
