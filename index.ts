import app, { getBribesAndCache } from "./src";
import { privateKeyToAccount } from "viem/accounts";
import { Network } from "./src/config/types";
import { setProposals } from "./src/scheduled";
import { transferBribes } from "./src/scheduled/transfer-bribes";
import { getPreviousDeadline } from "./src/utils";
import { configs } from "./src/config";
import {
  getBribeIdentifiers,
  getRewardIdentifiers,
} from "./src/services/bribes";

export interface Env {
  KV: KVNamespace;
  BW: Fetcher;
  URL: string;
  PRIVATE_KEY: `0x${string}`;
  INCENTIVES_KV: KVNamespace;
}

const chainAccount = (env: Env) => {
  return privateKeyToAccount(env.PRIVATE_KEY as `0x${string}`);
};

const setProposalsForNetworks = async (env: Env, networks: Network[]) => {
  for (const network of networks) {
    await setProposals(chainAccount(env), network);
    console.log("Set proposals for", network);
  }
};

const transferBribesForNetworks = async (env: Env, networks: Network[]) => {
  for (const network of networks) {
    const config = configs[network];
    // get previous deadline
    const previousDeadline = getPreviousDeadline(
      config.proposalStartTime,
      config.proposalDuration
    );
    console.log("Previous deadline", previousDeadline);
    const identifiers = await getRewardIdentifiers(
      BigInt(previousDeadline),
      network
    );
    console.log("Identifiers", identifiers);

    if (identifiers.length > 0) {
      await transferBribes(chainAccount(env), identifiers, network);
      console.log("Transferred bribes for", network);
    } else {
      console.log("No bribes to transfer for", network);
    }
  }
};

export default {
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log("Cron job triggered", event.cron);
    switch (event.cron) {
      case "0 0 * * *":
        // Cache previous deadline for incentives
        const previousDeadline = getPreviousDeadline(
          configs[Network.CELO].proposalStartTime,
          configs[Network.CELO].proposalDuration
        );
        console.log("Previous deadline", previousDeadline);
        await getBribesAndCache(Network.CELO, BigInt(previousDeadline), env);
        await setProposalsForNetworks(env, [Network.CELO, Network.ALFAJORES]);
        await transferBribesForNetworks(env, [Network.CELO, Network.ALFAJORES]);
        break;
    }
  },

  async fetch(request: Request, env: any) {
    console.log("Fetch triggered", request.url);
    return await app.fetch(request, env);
  },
};
