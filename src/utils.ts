import parser from "cron-parser";

export function getDeadlineFromCron(cron: string) {
  const interval = parser.parseExpression(cron);
  const nextDeadline = BigInt(
    Math.floor(interval.next().toDate().getTime() / 1000)
  ); // Convert to Unix timestamp in seconds
  return nextDeadline;
}
