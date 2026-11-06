import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import type { AddTesterResult } from "./addExternalTester";
import { addTester } from "./addTester";
import { readTestflightConfig } from "./readTestflightConfig";
import { TestflightError } from "./TestflightError";

const messages: Record<
	AddTesterResult,
	(email: string, group: string) => string
> = {
	created: (email, group) => `Invited ${email} to TestFlight group "${group}"`,
	added: (email, group) =>
		`Added existing tester ${email} to TestFlight group "${group}"`,
	"already-in-group": (email, group) =>
		`${email} is already in TestFlight group "${group}"`,
};

export async function testflightAdd(email: string): Promise<void> {
	try {
		const config = readTestflightConfig(loadConfig());
		const result = await addTester(config, email);
		const message = messages[result](email, config.externalGroup);
		console.log(
			result === "already-in-group"
				? chalk.yellow(message)
				: chalk.green(message),
		);
	} catch (error) {
		if (!(error instanceof TestflightError)) throw error;
		console.error(chalk.red(error.message));
		process.exit(1);
	}
}
