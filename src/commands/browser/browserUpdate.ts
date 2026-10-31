import chalk from "chalk";
import { describeUpdateCheck } from "./describeUpdateCheck";
import { requestBrowser } from "./requestBrowser";
import { waitForNewVersion } from "./waitForNewVersion";

function fail(message: string): never {
	console.error(chalk.red(`Error: ${message}`));
	process.exit(1);
}

export async function browserUpdate(options: {
	server: string;
}): Promise<void> {
	const reply = await requestBrowser(options.server, { op: "update" }).catch(
		(error: Error) => fail(error.message),
	);
	const { outcome, message } = describeUpdateCheck(reply);
	if (outcome === "failed") fail(message);
	console.log(message);
	if (outcome === "current") return;
	const installed = await waitForNewVersion(options.server, reply.version);
	if (!installed)
		fail(
			`the extension did not reconnect at a new version (still v${reply.version})`,
		);
	console.log(`updated v${reply.version} → v${installed}`);
}
