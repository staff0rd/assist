import chalk from "chalk";
import type {
	BrowserOp,
	BrowserRequest,
	ProbeResults,
} from "../extension/browserLink/types";
import { requestBrowser } from "./requestBrowser";

function fail(message: string): never {
	console.error(chalk.red(`Error: ${message}`));
	process.exit(1);
}

export async function requestTab<O extends BrowserOp>(
	server: string,
	request: BrowserRequest & { op: O },
): Promise<{ tabUrl: string } & ProbeResults[O] & { version: string }> {
	const reply = await requestBrowser<O>(server, request).catch((error: Error) =>
		fail(error.message),
	);
	if (!reply.ok) {
		if (reply.tabUrl) console.log(`tab: ${reply.tabUrl}`);
		fail(reply.error);
	}
	if (reply.result.tabUrl) console.log(`tab: ${reply.result.tabUrl}`);
	return { ...reply.result, version: reply.version };
}
