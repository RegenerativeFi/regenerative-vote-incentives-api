import parser from "cron-parser";

export function getDeadlineFromCron(cron: string) {
  const interval = parser.parseExpression(cron);
  const nextDeadline = BigInt(
    Math.floor(interval.next().toDate().getTime() / 1000)
  ); // Convert to Unix timestamp in seconds
  return nextDeadline;
}

export function getPreviousDeadline(startTime: number, duration: number) {
  const now = Math.floor(Date.now() / 1000);

  // Validate inputs
  if (duration <= 0) throw new Error("Duration must be positive");
  if (startTime > now) throw new Error("Start time is in the future");

  // Calculate previous deadline
  const periodsSinceStart = Math.floor((now - startTime) / duration);
  if (periodsSinceStart < 0) return startTime;

  return startTime + periodsSinceStart * duration;
}
