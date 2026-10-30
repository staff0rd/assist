import { isDeepStrictEqual } from "node:util";
import chalk from "chalk";

const warnedRules = new Set<string>();

function adviceRules(raw: Record<string, unknown> | undefined): unknown[] {
	const advice = raw?.advice as { rules?: unknown } | undefined;
	return Array.isArray(advice?.rules) ? advice.rules : [];
}

export function warnUnsharedAdviceRules(
	globalRaw: Record<string, unknown>,
	userDb: Record<string, unknown> | undefined,
): void {
	if (userDb === undefined) return;
	const shared = adviceRules(userDb);
	const unshared = adviceRules(globalRaw).filter(
		(rule) => !shared.some((entry) => isDeepStrictEqual(entry, rule)),
	);
	const signature = JSON.stringify(unshared);
	if (unshared.length === 0 || warnedRules.has(signature)) return;
	warnedRules.add(signature);
	console.error(
		chalk.yellow(
			`advice.rules in ~/.assist.yml has ${unshared.length} rule(s) not in user (db), so other nodes don't see them. Run 'assist config import-user' to share them.`,
		),
	);
}
