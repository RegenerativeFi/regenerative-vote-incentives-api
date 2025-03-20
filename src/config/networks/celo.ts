import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
} from "viem";
import { celo as celoChain } from "viem/chains";
import { Gauge, Network, NetworkConfig } from "../types";

export const publicClient = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: celoChain,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: celoChain,
  transport: http(),
});

const gaugeList: Gauge[] = [
  {
    address: "0x6ACa0EB87a429ad5240f03E56E37b6a3B16F2ddb",
    lpToken: "0x1a239aab16b9625c45d80744a4341f8de2200e1a",
    lpSymbol: "tREFI-tCELO",
  },
  {
    address: "0x9B75De95CdB73fB961a681812252Fb2f0e6567cf",
    lpToken: "0x4433f250f4952055784b48fb0df74d0aa1a5126a",
    lpSymbol: "50tcUSD-50tCELO",
  },
  {
    address: "0x529cF13B660745a07DedC5DC80Ed03f5441e040c",
    lpToken: "0xada3c5d33261c17011a4cf36cf859af1841a2c74",
    lpSymbol: "tCELO-tUSDC",
  },
];

const allowedTokens = [
  "0x68DF333c5F5835A186AA8bCe4a704432006fDF49", // tREFI
  "0xD1531Aa8F91f5Fd8D5D820CD5841e3880283D1Be", // tCELO
  "0xB08Dd0b53abD8fB842cDec75cc5064FDD74e99C7", // tcUSD
  "0x76C12F93ad8975609f95C13782fd8A0B4135e4c6", // tUSDC
];

export const celo: NetworkConfig = {
  name: Network.CELO,
  client: publicClient as unknown as PublicClient,
  wallet: walletClient,
  proposalStartTime: 1742428800, // 2025-03-10 00:00:00 UTC
  proposalDuration: 86400,
  cronJobs: {
    setProposals: {
      cron: "0 0 * * *",
    },
  },
  contracts: {
    gaugeRegistry: "0x86Ec87AB1da08a72A57eAFFdb46109058d0BA285",
    gaugeController: "0xaa6D84773d993d3d09490a96e244C71592D6b6f1",
    bribeVault: "0xEBC4Bb8727FEa1f81a007E877A6e0b874a285255",
    protocolFeesCollector: "0x5D32d73AD1C2e5B776d06B6348b23462eB6CA4a9",
    regenerativeBribeMarket: "0xB367CB71B16D45a362600f37b77DD01699A5Dd23",
    rewardDistributor: "0x2874321070A9B6a9c81827BcA9Dd4F9EcD0631b8",
    votingEscrow: "0x05B87e716393F76b5854b4c194b90C26c24Cd90D",
  },
  gauges: gaugeList,
  allowedTokens: allowedTokens as `0x${string}`[],
};
