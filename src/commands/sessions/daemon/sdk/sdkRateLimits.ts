import type { SDKRateLimitInfo } from "@anthropic-ai/claude-agent-sdk";
import type { RateLimits } from "../../../../shared/RateLimits";

type Window = keyof RateLimits;
type WindowInfo = { utilization?: number; resetsAt?: number };

const WINDOWS: Window[] = ["five_hour", "seven_day"];

function toWindow(info: WindowInfo | undefined) {
	if (typeof info?.utilization !== "number") return undefined;
	return {
		used_percentage: Math.round(info.utilization * 100),
		resets_at: info.resetsAt,
	};
}

// why: unifiedWindows (both windows at once) is sent by the CLI but absent from the SDK's types; older CLIs report only the window named by rateLimitType.
function windowInfo(info: SDKRateLimitInfo, window: Window) {
	const unified = (info as { unifiedWindows?: Record<string, WindowInfo> })
		.unifiedWindows;
	if (unified) return unified[window];
	return info.rateLimitType === window ? info : undefined;
}

export function sdkRateLimits(info: SDKRateLimitInfo): RateLimits | undefined {
	const limits: RateLimits = {};
	for (const window of WINDOWS) {
		const observed = toWindow(windowInfo(info, window));
		if (observed) limits[window] = observed;
	}
	return Object.keys(limits).length ? limits : undefined;
}
