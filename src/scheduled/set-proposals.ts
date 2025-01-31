import { getRegisteredGauges } from "../services/gauges";
import {
  filterAlreadySetProposals,
  setProposalsData,
} from "../services/proposals";
import { Network } from "../config/types";
import { configs } from "../config";
import parser from "cron-parser";
import { Account } from "viem/accounts";

export async function setProposals(account: Account, network: Network) {
  console.log("Setting proposals for", network);
  const config = configs[network];
  // Fetch Gauges
  const gauges = await getRegisteredGauges(network);
  console.log("Gauges", gauges);
  if (gauges.length === 0) {
    console.log("No gauges found for", network);
    return;
  }
  // get deadline from cron expression
  const cronExpression = config.cronJobs.setProposals.cron;
  const interval = parser.parseExpression(cronExpression);
  const nextDeadline = BigInt(
    Math.floor(interval.next().toDate().getTime() / 1000)
  ); // Convert to Unix timestamp in seconds
  console.log("Next deadline", nextDeadline);
  // Check if proposals are already set
  const filteredProposals = await filterAlreadySetProposals(
    [...gauges],
    nextDeadline,
    network
  );

  if (filteredProposals.length === 0) {
    console.log("Proposals are already set for", network);
    return;
  }

  const proposalData = setProposalsData([...gauges], nextDeadline);

  const tx = await config.wallet.sendTransaction({
    to: config.contracts.regenerativeBribeMarket,
    data: proposalData,
    account,
    chain: config.wallet.chain,
  });

  console.log("Proposals set", tx);
  return tx;
}
