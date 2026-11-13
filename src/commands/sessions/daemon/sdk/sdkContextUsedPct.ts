import type { SDKResultMessage } from "@anthropic-ai/claude-agent-sdk";

type CallUsage = {
	input_tokens?: number;
	cache_read_input_tokens?: number | null;
	cache_creation_input_tokens?: number | null;
};

export function sdkContextTokens(usage: CallUsage | undefined): number {
	if (!usage) return 0;
	return (
		(usage.input_tokens ?? 0) +
		(usage.cache_read_input_tokens ?? 0) +
		(usage.cache_creation_input_tokens ?? 0)
	);
}

export function sdkContextUsedPct(
	contextTokens: number,
	model: string | undefined,
	result: SDKResultMessage,
): number | undefined {
	const windows = Object.entries(result.modelUsage ?? {});
	const contextWindow =
		(model && result.modelUsage?.[model]?.contextWindow) ||
		Math.max(0, ...windows.map(([, usage]) => usage.contextWindow ?? 0));
	if (!contextTokens || !contextWindow) return undefined;
	return Math.min(100, Math.round((contextTokens / contextWindow) * 100));
}
