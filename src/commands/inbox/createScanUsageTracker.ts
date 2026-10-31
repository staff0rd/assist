import { parseClaudeUsage } from "../review/parseClaudeUsage";
import type { TokenUsage } from "../review/TokenUsage";
import { emptyScanUsage } from "./emptyScanUsage";
import { scanUsageTokens } from "./scanUsageTokens";

type ResultFields = { total_cost_usd?: unknown; duration_ms?: unknown };

const numberOrNull = (value: unknown) =>
	typeof value === "number" ? value : null;

export function createScanUsageTracker() {
	const usage = emptyScanUsage();
	const turns = new Map<string, TokenUsage>();
	let unsettled = 0;

	return {
		current: () => ({ ...usage }),
		// stream-json repeats a message's usage on every content-block line, so
		// each turn is counted once by message id, applying only the change.
		addTurn(id: unknown, raw: unknown): boolean {
			const parsed = parseClaudeUsage(raw);
			if (!parsed) return false;
			const key = typeof id === "string" ? id : `turn-${turns.size}`;
			const previous = turns.get(key);
			turns.set(key, parsed);
			usage.input += parsed.input - (previous?.input ?? 0);
			usage.output += parsed.output - (previous?.output ?? 0);
			usage.cacheRead += parsed.cacheRead - (previous?.cacheRead ?? 0);
			usage.cacheWrite +=
				(parsed.cacheWrite ?? 0) - (previous?.cacheWrite ?? 0);
			unsettled +=
				scanUsageTokens(parsed) - (previous ? scanUsageTokens(previous) : 0);
			return true;
		},
		takeTurnTokens(): number | undefined {
			const tokens = unsettled;
			unsettled = 0;
			return tokens > 0 ? tokens : undefined;
		},
		finish(result: ResultFields) {
			usage.costUsd = numberOrNull(result.total_cost_usd);
			usage.durationMs = numberOrNull(result.duration_ms);
		},
	};
}
