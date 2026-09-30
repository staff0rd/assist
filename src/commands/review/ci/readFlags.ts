import { parseArgs } from "node:util";
import type { ReviewCiKey } from "./reviewCiVariables";

const flagKeys: Record<string, ReviewCiKey> = {
	provider: "ASSIST_REVIEW_PROVIDER",
	"base-url": "ASSIST_REVIEW_BASE_URL",
	"claude-model": "ASSIST_REVIEW_CLAUDE_MODEL",
	"codex-model": "ASSIST_REVIEW_CODEX_MODEL",
};

export function readFlags(
	argv: string[],
): Partial<Record<ReviewCiKey, string>> {
	const { values } = parseArgs({
		args: argv,
		options: Object.fromEntries(
			Object.keys(flagKeys).map((flag) => [flag, { type: "string" }]),
		),
	});
	return Object.fromEntries(
		Object.entries(values).map(([flag, value]) => [flagKeys[flag], value]),
	);
}
