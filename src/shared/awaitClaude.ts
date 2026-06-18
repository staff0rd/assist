import chalk from "chalk";

// Awaits a spawned Claude run, turning a spawn failure (e.g. a missing `claude`
// binary) into a logged error and a false result rather than an uncaught
// rejection. Returns true when the run exited on its own.
export async function awaitClaude(
	done: Promise<number>,
	context: string,
): Promise<boolean> {
	try {
		await done;
		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(
			chalk.red(`\nFailed to launch Claude for ${context}: ${message}`),
		);
		return false;
	}
}
