import chalk from "chalk";
import type {
	BrowserRequest,
	ProbeResults,
	TabOp,
} from "../extension/browserLink/types";
import { requestBrowser } from "./requestBrowser";

function fail(message: string): never {
	console.error(chalk.red(`Error: ${message}`));
	process.exit(1);
}

export async function requestTab<O extends TabOp>(
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
	const result = reply.result as { tabUrl: string } & ProbeResults[O];
	if (result.tabUrl) console.log(`tab: ${result.tabUrl}`);
	return { ...result, version: reply.version };
}
