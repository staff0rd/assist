import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { findSessionJsonlPath } from "../../shared/findSessionJsonlPath";
import { daemonLog } from "../daemonLog";
import { createSdkContextRefresh } from "./createSdkContextRefresh";
import type { SdkContextReader } from "./sdkContextReader";
import { sdkContextTokens, sdkContextUsedPct } from "./sdkContextUsedPct";
import { recordSdkRateLimits } from "./recordSdkRateLimits";
import { sdkUsageSink } from "./sdkUsageSink";

export function createSdkUsageObserver(
	label: string,
	readContext?: SdkContextReader,
) {
	let contextTokens = 0;
	const context = createSdkContextRefresh(label, readContext);
	let model: string | undefined;
	let transcriptPath: Promise<string | null> | undefined;
	const transcriptFor = (claudeSessionId: string) => {
		transcriptPath ??= findSessionJsonlPath(claudeSessionId).catch(() => null);
		return transcriptPath;
	};
	return (message: SDKMessage): void => {
		const sink = sdkUsageSink();
		if (message.type === "rate_limit_event")
			recordSdkRateLimits(label, message.rate_limit_info);
		else if (
			message.type === "assistant" &&
			message.parent_tool_use_id === null
		) {
			contextTokens = sdkContextTokens(message.message.usage) || contextTokens;
			model = message.message.model ?? model;
			context.refresh(message.session_id);
		} else if (message.type === "result") {
			const usedPct =
				context.latest() ?? sdkContextUsedPct(contextTokens, model, message);
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
