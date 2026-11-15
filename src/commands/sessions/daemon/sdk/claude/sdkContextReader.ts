import type { Query } from "@anthropic-ai/claude-agent-sdk";

export type SdkContextReader = () => Promise<number>;

export function sdkContextReader(
	messages: unknown,
): SdkContextReader | undefined {
	if (
		!messages ||
		typeof messages !== "object" ||
		!("getContextUsage" in messages)
	)
		return undefined;
	const query = messages as Query;
	return async () =>
		(await query.getContextUsage({ detail: "summary" })).percentage;
}
