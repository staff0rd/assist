import chalk from "chalk";

export const CLAUDE_SPAWN_FAILED = null;

export async function awaitClaude(
	done: Promise<number>,
	context: string,
): Promise<number | typeof CLAUDE_SPAWN_FAILED> {
	try {
		return await done;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(
			chalk.red(`\nFailed to launch Claude for ${context}: ${message}`),
		);
		return CLAUDE_SPAWN_FAILED;
	}
}
