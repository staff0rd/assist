import chalk from "chalk";
import { assistConfigSchema } from "../../shared/types";

export function validateConfig(
	updated: Record<string, unknown>,
	key: string,
): Record<string, unknown> {
	const result = assistConfigSchema.safeParse(updated);
	if (!result.success) return exitValidationFailed(result.error.issues, key);
	return updated;
}

function exitValidationFailed(
	issues: { path: PropertyKey[]; message: string }[],
	key: string,
): never {
	printValidationErrors(issues, key);
	process.exit(1);
}

function printValidationErrors(
	issues: { path: PropertyKey[]; message: string }[],
	key: string,
): void {
	for (const issue of issues) {
		console.error(
			chalk.red(`${formatIssuePath(issue, key)}: ${issue.message}`),
		);
	}
}

function formatIssuePath(issue: { path: PropertyKey[] }, key: string): string {
	return issue.path.length > 0 ? issue.path.join(".") : key;
}
