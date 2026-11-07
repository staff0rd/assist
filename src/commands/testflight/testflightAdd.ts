import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { addTesterOutcome } from "./addTesterOutcome";
import { readTestflightConfig } from "./readTestflightConfig";
import { TestflightError } from "./TestflightError";

export async function testflightAdd(
	email: string,
	options: { internal?: boolean },
): Promise<void> {
	try {
		const config = readTestflightConfig(loadConfig());
		const { message, waiting } = await addTesterOutcome(config, email, {
			internal: options.internal,
		});
		console.log(waiting ? chalk.yellow(message) : chalk.green(message));
	} catch (error) {
		if (!(error instanceof TestflightError)) throw error;
		console.error(chalk.red(error.message));
		process.exit(1);
	}
}
