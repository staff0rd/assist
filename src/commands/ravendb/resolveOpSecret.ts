import { execSync } from "node:child_process";
import chalk from "chalk";

export function resolveOpSecret(reference: string): string {
	if (!reference.startsWith("op://")) {
		console.error(chalk.red(`Invalid secret reference: must start with op://`));
		process.exit(1);
	}

	try {
		return execSync(`op read "${reference}"`, {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
	} catch {
		console.error(
			chalk.red(
				"Failed to resolve secret reference. Ensure 1Password CLI is installed and you are signed in.",
			),
		);
		process.exit(1);
	}
}
