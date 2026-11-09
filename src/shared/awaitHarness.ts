import chalk from "chalk";

export const HARNESS_SPAWN_FAILED = null;

export async function awaitHarness(
	done: Promise<number>,
	context: string,
	harnessLabel: string,
): Promise<number | typeof HARNESS_SPAWN_FAILED> {
	try {
		return await done;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(
			chalk.red(
				`\nFailed to launch ${harnessLabel} for ${context}: ${message}`,
			),
		);
		return HARNESS_SPAWN_FAILED;
	}
}
