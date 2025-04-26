import { Hono } from "hono";
import { cors } from "hono/cors";
import { Network } from "./config/types";
import { Bindings } from "./types";
import {
  allowedTokens,
  getBribeIdentifiers,
  getBribes,
} from "./services/bribes";
import { getDeadlineFromCron } from "./utils";
import { configs } from "./config";
import { Env } from "../index";

const app = new Hono<{ Bindings: Bindings }>();

app.use(cors());

app.get("/", (c) => {
  return c.text("Hello World");
});

export const getCacheKey = (network: Network, deadline: string) => {
  return `incentives:${network}:${deadline}`;
};

export const getBribesAndCache = async (
  network: Network,
  deadline: bigint,
  env: Env
) => {
  const identifiers = await getBribeIdentifiers(deadline, network);
  const cacheKey = getCacheKey(network, deadline.toString());

  if (identifiers.length === 0) {
    const emptyResponse = { bribes: [] };
    // For empty responses, always use short cache time
    await env.INCENTIVES_KV.put(cacheKey, JSON.stringify(emptyResponse));
  }

  const bribes = await getBribes(
    identifiers as unknown as `0x${string}`[],
    network
  );

  const response = {
    bribes: bribes.map((b) => ({
      ...b,
      amount: b.amount.toString(),
    })),
  };

  await env.INCENTIVES_KV.put(cacheKey, JSON.stringify(response));
};

const getCacheOptions = (deadline: bigint) => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  // If deadline has passed, cache permanently (no expiration)
  // Otherwise cache for 5 minutes
  return deadline < now ? {} : { expirationTtl: 300 };
};

app.get("/:network/get-incentives", async (c) => {
  const network = c.req.param("network") as Network;

  if (!network) {
    return c.json({ error: "Network is required" }, 400);
  }

  if (!Object.values(Network).includes(network)) {
    return c.json({ error: "Invalid network" }, 400);
  }

  const cron = configs[network].cronJobs.setProposals.cron;
  const deadline = getDeadlineFromCron(cron);

  // Try to get from cache first
  const cacheKey = getCacheKey(network, deadline.toString());
  const cached = await c.env.INCENTIVES_KV.get(cacheKey);
  if (cached) {
    return c.json(JSON.parse(cached));
  }

  const identifiers = await getBribeIdentifiers(deadline, network);

  if (identifiers.length === 0) {
    const emptyResponse = { bribes: [] };
    // For empty responses, always use short cache time
    await c.env.INCENTIVES_KV.put(cacheKey, JSON.stringify(emptyResponse), {
      expirationTtl: 60,
    });
    return c.json(emptyResponse);
  }

  const bribes = await getBribes(
    identifiers as unknown as `0x${string}`[],
    network
  );

  const response = {
    bribes: bribes.map((b) => ({
      ...b,
      amount: b.amount.toString(),
    })),
  };

  await c.env.INCENTIVES_KV.put(
    cacheKey,
    JSON.stringify(response),
    getCacheOptions(deadline)
  );
  return c.json(response);
});

app.get("/:network/get-incentives/:deadline", async (c) => {
  const network = c.req.param("network") as Network;
  const deadline = c.req.param("deadline") as string;

  if (!network) {
    return c.json({ error: "Network is required" }, 400);
  }

  if (!Object.values(Network).includes(network)) {
    return c.json({ error: "Invalid network" }, 400);
  }

  if (!deadline) {
    return c.json({ error: "Deadline is required" }, 400);
  }

  // Try to get from cache first
  const cacheKey = getCacheKey(network, deadline);
  const cached = await c.env.INCENTIVES_KV.get(cacheKey);
  if (cached) {
    return c.json(JSON.parse(cached));
  }

  const bigintDeadline = BigInt(deadline);
  const identifiers = await getBribeIdentifiers(bigintDeadline, network);

  if (identifiers.length === 0) {
    const emptyResponse = { bribes: [] };
    // For empty responses, always use short cache time
    await c.env.INCENTIVES_KV.put(cacheKey, JSON.stringify(emptyResponse), {
      expirationTtl: 60,
    });
    return c.json(emptyResponse);
  }

  const bribes = await getBribes(
    identifiers as unknown as `0x${string}`[],
    network
  );

  const response = {
    bribes: bribes.map((b) => ({
      ...b,
      amount: b.amount.toString(),
    })),
  };

  await c.env.INCENTIVES_KV.put(
    cacheKey,
    JSON.stringify(response),
    getCacheOptions(bigintDeadline)
  );
  return c.json(response);
});

export default app;
