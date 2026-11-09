import type {
	ConnectorRunEvent,
	ConnectorTool,
	HarnessAdapter,
} from "../../shared/harnessAdapters/types";
import { createGmailCoverage } from "./createGmailCoverage";
import type { InboxScanListener, InboxScanUsage } from "./InboxScanEvent";
import { inboxConnectorRun } from "./inboxConnectorRun";
import { inboxProgressEvent } from "./inboxProgressEvent";
import type { FlaggedMessage } from "./inboxScanSchema";
import { parseInboxScanOutput } from "./parseInboxScanOutput";

export type InboxScanPass = { prompt: string; tools: ConnectorTool[] };

export type InboxScanResult = {
	messages: FlaggedMessage[];
	usage: InboxScanUsage;
	threads: { found: string[]; opened: string[] };
};

export async function runInboxScanPass(
	adapter: HarnessAdapter,
	{ prompt, tools }: InboxScanPass,
	{
		onEvent = () => {},
		onUsage = () => {},
		onModel = () => {},
	}: InboxScanListener = {},
): Promise<InboxScanResult> {
	const coverage = createGmailCoverage();
	const handle = (event: ConnectorRunEvent) => {
		coverage.onEvent(event);
		if (event.type === "model") onModel(event.model);
		else if (event.type === "usage") onUsage(event.usage);
		const progress = inboxProgressEvent(event);
		if (progress) onEvent(progress);
	};
	const result = await inboxConnectorRun(adapter, prompt, tools, handle);
	return {
		messages: parseInboxScanOutput(result.output),
		usage: result.usage,
		threads: coverage.current(),
	};
}
