import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import type { InternalTesterResult } from "./addInternalTester";
import { addTester } from "./addTester";
import { readTestflightConfig } from "./readTestflightConfig";
import { TestflightError } from "./TestflightError";

const messages: Record<
	InternalTesterResult,
	(email: string, group: string) => string
> = {
	created: (email, group) => `Invited ${email} to TestFlight group "${group}"`,
	added: (email, group) =>
		`Added existing tester ${email} to TestFlight group "${group}"`,
	"already-in-group": (email, group) =>
		`${email} is already in TestFlight group "${group}"`,
	invited: (email) =>
		`Sent ${email} an App Store Connect team invite. Once they accept, re-run this command to add them to TestFlight.`,
	"invite-pending": (email) =>
		`${email} has not yet accepted their App Store Connect team invite. Re-run this command once they do.`,
};

const pending = new Set<InternalTesterResult>([
	"already-in-group",
	"invite-pending",
]);

export async function testflightAdd(
	email: string,
	options: { internal?: boolean },
): Promise<void> {
	try {
		const config = readTestflightConfig(loadConfig());
		const result = await addTester(config, email, {
			internal: options.internal,
		});
		const group = options.internal
			? (config.internalGroup ?? "")
			: config.externalGroup;
		const message = messages[result](email, group);
		console.log(
			pending.has(result) ? chalk.yellow(message) : chalk.green(message),
		);
	} catch (error) {
		if (!(error instanceof TestflightError)) throw error;
		console.error(chalk.red(error.message));
		process.exit(1);
	}
}
