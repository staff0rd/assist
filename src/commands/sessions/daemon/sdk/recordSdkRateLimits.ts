import type { SDKRateLimitEvent } from "@anthropic-ai/claude-agent-sdk";
import { daemonLog } from "../daemonLog";
import { sdkRateLimits } from "./sdkRateLimits";
import { sdkUsageSink } from "./sdkUsageSink";

export function recordSdkRateLimits(
	label: string,
	info: SDKRateLimitEvent["rate_limit_info"],
): void {
	const limits = sdkRateLimits(info);
	if (!limits) return;
	daemonLog(
		`${label} sdk rate limits: 5h ${limits.five_hour?.used_percentage ?? "-"}% 7d ${limits.seven_day?.used_percentage ?? "-"}%`,
	);
	sdkUsageSink()?.limits(limits);
}
