import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
} from "viem";
import { celoAlfajores } from "viem/chains";
import { Gauge, Network, NetworkConfig } from "../types";

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

const gaugeList: Gauge[] = [
  {
    address: "0xd031e387129a0f8ab6500c4e9fb4342e568256d7",
    lpToken: "0xf1a6f7570f0eefbb824ea05d32c88e78f0ed1564",
    lpSymbol: "80tREGEN-20tCELO",
  },
  {
    address: "0x30629e6ef6dbcfc7e16a746b5204173efa50f606",
    lpToken: "0x614eb78cf5e2a78bd017a85190e998963d4febb9",
    lpSymbol: "50tcUSD-50tCELO",
  },
  {
    address: "0x215586111f9c15bda4e0754f1c38b2789a504914",
    lpToken: "0xc60165f780da1dd32d969866bfd5b9c7007d8820",
    lpSymbol: "tcUSD-tUSDC",
  },
];

const allowedTokens = [
  "0xE036290F41c367AeC59aec5B69C2B72068C441f6", // tCELO
  "0x51f29e07c7cf53D2603e1A224E27b1c74E181a17", // tcUSD
  "0x9A3a52f4462585c31025e2242C9b4074a9FB4a1f", // tUSDC
];

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
  gauges: gaugeList,
  allowedTokens: allowedTokens as `0x${string}`[],
};
