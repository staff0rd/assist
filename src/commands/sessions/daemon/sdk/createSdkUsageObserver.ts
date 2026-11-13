import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { findSessionJsonlPath } from "../../shared/findSessionJsonlPath";
import { daemonLog } from "../daemonLog";
import { sdkContextTokens, sdkContextUsedPct } from "./sdkContextUsedPct";
import { sdkRateLimits } from "./sdkRateLimits";
import { sdkUsageSink } from "./sdkUsageSink";

export function createSdkUsageObserver(label: string) {
	let contextTokens = 0;
	let model: string | undefined;
	let transcriptPath: Promise<string | null> | undefined;
	const transcriptFor = (claudeSessionId: string) => {
		transcriptPath ??= findSessionJsonlPath(claudeSessionId).catch(() => null);
		return transcriptPath;
	};
	return (message: SDKMessage): void => {
		const sink = sdkUsageSink();
		if (message.type === "rate_limit_event") {
			const limits = sdkRateLimits(message.rate_limit_info);
			if (!limits) return;
			daemonLog(
				`${label} sdk rate limits: 5h ${limits.five_hour?.used_percentage ?? "-"}% 7d ${limits.seven_day?.used_percentage ?? "-"}%`,
			);
			sink?.limits(limits);
		} else if (
			message.type === "assistant" &&
			message.parent_tool_use_id === null
		) {
			contextTokens = sdkContextTokens(message.message.usage) || contextTokens;
			model = message.message.model ?? model;
		} else if (message.type === "result") {
			const usedPct = sdkContextUsedPct(contextTokens, model, message);
			const claudeSessionId = message.session_id;
			daemonLog(
				`${label} sdk usage: claude session ${claudeSessionId} context ${usedPct ?? "-"}%`,
			);
			if (!sink) return;
			void transcriptFor(claudeSessionId).then((path) =>
				sink.usage(claudeSessionId, path ?? undefined, usedPct),
			);
		}
	};
}
