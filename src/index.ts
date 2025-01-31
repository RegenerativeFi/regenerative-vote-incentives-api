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
import { getAllProposalIds } from "./services/proposals";

const app = new Hono<{ Bindings: Bindings }>();

app.use(cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/:network/get-incentives", async (c) => {
  const network = c.req.param("network") as keyof typeof Network;

  if (!network) {
    return c.json({ error: "Network is required" }, 400);
  }

  if (!Object.keys(Network).includes(network)) {
    return c.json({ error: "Invalid network" }, 400);
  }

  const cron = configs[Network[network]].cronJobs.setProposals.cron;
  const deadline = getDeadlineFromCron(cron);

  const identifiers = await getBribeIdentifiers(
    deadline,
    Network[network as keyof typeof Network]
  );

  if (identifiers.length === 0) {
    return c.json({ bribes: [] });
  }

  const bribes = await getBribes(
    identifiers as unknown as `0x${string}`[],
    Network[network as keyof typeof Network]
  );

  return c.json({
    bribes: bribes.map((b) => ({
      ...b,
      amount: b.amount.toString(),
    })),
  });
});

app.get("/:network/get-incentives/:deadline", async (c) => {
  const network = c.req.param("network") as keyof typeof Network;
  const deadline = c.req.param("deadline") as string;
  if (!network) {
    return c.json({ error: "Network is required" }, 400);
  }

  if (!Object.keys(Network).includes(network)) {
    return c.json({ error: "Invalid network" }, 400);
  }

  if (!deadline) {
    return c.json({ error: "Deadline is required" }, 400);
  }

  const bigintDeadline = BigInt(deadline);

  const identifiers = await getBribeIdentifiers(
    bigintDeadline,
    Network[network]
  );

  if (identifiers.length === 0) {
    return c.json({ bribes: [] });
  }

  const bribes = await getBribes(
    identifiers as unknown as `0x${string}`[],
    Network[network]
  );

  return c.json({
    bribes: bribes.map((b) => ({
      ...b,
      amount: b.amount.toString(),
    })),
  });
});

app.get("/:network/test-request-speeds", async (c) => {
  const network = c.req.param("network") as keyof typeof Network;

  console.time("getBribeIdentifiers");
  const identifiers = await getBribeIdentifiers(
    BigInt(1736294400),
    Network[network]
  );
  console.timeEnd("getBribeIdentifiers");

  console.time("getBribes");
  await getBribes(identifiers as unknown as `0x${string}`[], Network[network]);
  console.timeEnd("getBribes");

  return c.text("Test request speeds");
});

export default app;
