import { http } from "viem";
import { createWalletClient } from "viem";
import app from "./src";
import { privateKeyToAccount } from "viem/accounts";
import { Network } from "./src/config/types";
import { configs } from "./src/config";
import { setProposals } from "./src/scheduled";
export interface Env {
  KV: KVNamespace;
  BW: Fetcher;
  URL: string;
  PRIVATE_KEY: `0x${string}`;
}

const chainAccount = (env: Env) => {
  return privateKeyToAccount(env.PRIVATE_KEY as `0x${string}`);
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
        console.log("Setting proposals for Alfa");
        await setProposals(chainAccount(env), Network.ALFAJORES);
        break;
    }
  },

  async fetch(request: Request, env: any) {
    console.log("Fetch triggered", request.url);
    return await app.fetch(request, env);
  },
};
