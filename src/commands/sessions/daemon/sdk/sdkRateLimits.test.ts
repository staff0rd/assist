import type { SDKRateLimitInfo } from "@anthropic-ai/claude-agent-sdk";
import { describe, expect, it } from "vitest";
import { sdkRateLimits } from "./sdkRateLimits";

describe("sdkRateLimits", () => {
	it("reads both windows from unifiedWindows as percentages", () => {
		const info = {
			status: "allowed",
			rateLimitType: "five_hour",
			unifiedWindows: {
				five_hour: { utilization: 0.17, resetsAt: 100 },
				seven_day: { utilization: 0.214, resetsAt: 200 },
			},
		} as unknown as SDKRateLimitInfo;
		expect(sdkRateLimits(info)).toEqual({
			five_hour: { used_percentage: 17, resets_at: 100 },
			seven_day: { used_percentage: 21, resets_at: 200 },
		});
	});

	it("falls back to the single window named by rateLimitType", () => {
		expect(
			sdkRateLimits({
				status: "allowed_warning",
				rateLimitType: "seven_day",
				utilization: 0.8,
				resetsAt: 300,
			}),
		).toEqual({ seven_day: { used_percentage: 80, resets_at: 300 } });
	});

	it("returns undefined when no window reports utilization", () => {
		expect(sdkRateLimits({ status: "allowed" })).toBeUndefined();
	});
});
