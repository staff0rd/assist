import { formatTokens } from "../../shared/formatTokens";
import { formatScanCost } from "./formatScanCost";
import type { InboxScanUsage } from "./InboxScanEvent";
import { scanUsageTokens } from "./scanUsageTokens";

export function formatScanUsage(usage: InboxScanUsage): string {
	const tokens = `${formatTokens(scanUsageTokens(usage))} tokens`;
	return usage.costUsd === null
		? tokens
		: `${tokens} · ${formatScanCost(usage.costUsd)}`;
}
