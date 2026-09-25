import type { ResponseUsage } from "../../../../shared/db/recordPhaseTranscriptUsage";
import type { RateLimits } from "../../../../shared/RateLimits";

export type CodexRolloutUsage = {
	responses: ResponseUsage[];
	usedPct?: number;
	rateLimits?: RateLimits;
};

type TokenUsage = {
	input_tokens?: number;
	cached_input_tokens?: number;
	output_tokens?: number;
	total_tokens?: number;
};

type TokenInfo = {
	total_token_usage?: TokenUsage;
	last_token_usage?: TokenUsage;
	model_context_window?: number;
};

export function applyTokenInfo(
	usage: CodexRolloutUsage,
	byId: Map<string, ResponseUsage>,
	conversationId: string,
	rawInfo: unknown,
): void {
	if (!rawInfo || typeof rawInfo !== "object") return;
	const info = rawInfo as TokenInfo;
	const last = info.last_token_usage;
	const cumulative = info.total_token_usage?.total_tokens;
	if (!last || typeof cumulative !== "number") return;
	const messageId = `codex:${conversationId}:${cumulative}`;
	byId.set(messageId, {
		messageId,
		inputTokens: Math.max(
			0,
			(last.input_tokens ?? 0) - (last.cached_input_tokens ?? 0),
		),
		outputTokens: last.output_tokens ?? 0,
	});
	const contextWindow = info.model_context_window;
	if (contextWindow && typeof last.total_tokens === "number")
		usage.usedPct = Math.min(100, (last.total_tokens / contextWindow) * 100);
}
