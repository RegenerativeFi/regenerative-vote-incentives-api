import { BribeVaultAbi } from "../config/abis";

import { encodeFunctionData, getContract } from "viem";

import { configs } from "../config";
import { Network } from "../config/types";
import { Account } from "viem/accounts";

export const transferBribesData = (bribeIdentifiers: `0x${string}`[]) => {
  const data = encodeFunctionData({
    abi: BribeVaultAbi,
    functionName: "transferBribes",
    args: [bribeIdentifiers],
  });

  return data;
};
/**
 * Transfers bribes from the bribe vault to the reward distributor
 * @param bribeIdentifiers - The bribe identifiers to transfer
 * @param network - The network to transfer the bribes on
 */
export async function transferBribes(
  account: Account,
  bribeIdentifiers: `0x${string}`[],
  network: Network
) {
  const config = configs[network];

  const tx = await config.wallet.sendTransaction({
    to: config.contracts.bribeVault,
    data: transferBribesData(bribeIdentifiers),
    account,
    chain: config.wallet.chain,
  });

  console.log("Transferred bribes", tx);
  return tx;
}
