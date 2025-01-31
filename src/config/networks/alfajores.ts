import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
} from "viem";
import { celoAlfajores } from "viem/chains";
import { Network, NetworkConfig } from "../types";

export const publicClient = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: celoAlfajores,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: celoAlfajores,
  transport: http(),
});

export const alfajores: NetworkConfig = {
  name: Network.ALFAJORES,
  client: publicClient as unknown as PublicClient,
  wallet: walletClient,
  proposalStartTime: 1735948800, // 2025-01-04 00:00:00 UTC
  proposalDuration: 86400,
  cronJobs: {
    setProposals: {
      cron: "0 0 * * *",
    },
  },
  contracts: {
    gaugeRegistry: "0x86Ec87AB1da08a72A57eAFFdb46109058d0BA285",
    gaugeController: "0x0B58399530a0664C0B1ad7e7d290fFAC854930f8",
    bribeVault: "0x16A3793F3B62C285B7d5dcb36cc4652FF2a46d2A",
    protocolFeesCollector: "0x5D32d73AD1C2e5B776d06B6348b23462eB6CA4a9",
    regenerativeBribeMarket: "0xfc1a572A24a902DEc2706a7A34F2803EaBaEba3C",
    rewardDistributor: "0x60DcBeC73d95ab9E823b0eE7343003df121AA478",
    votingEscrow: "0x56Fa6A4cBED97E2ed4c4d1d272b8375F46970F92",
  },
};
