type Tokens = {
	input: number;
	output: number;
	cacheRead: number;
	cacheWrite?: number;
};

export function scanUsageTokens(usage: Tokens): number {
	return usage.input + usage.output + usage.cacheRead + (usage.cacheWrite ?? 0);
}
