import type { HarnessAdapter } from "../../shared/harnessAdapters/types";
import { addScanUsage } from "./addScanUsage";
import { buildInboxScanPrompt } from "./buildInboxScanPrompt";
import { buildInboxThreadsPrompt } from "./buildInboxThreadsPrompt";
import { emptyScanUsage } from "./emptyScanUsage";
import type { InboxScanListener, InboxScanUsage } from "./InboxScanEvent";
import type { FlaggedMessage } from "./inboxScanSchema";
import { type InboxScanPass, runInboxScanPass } from "./runInboxScanPass";
import { scanUnopenedThreads } from "./scanUnopenedThreads";

export type InboxScanOutput = {
	messages: FlaggedMessage[];
	usage: InboxScanUsage;
};

export async function scanInboxWithCoverage(
	adapter: HarnessAdapter,
	since: Date,
	listener: InboxScanListener,
): Promise<InboxScanOutput> {
	const runs: InboxScanUsage[] = [];
	const total = () => runs.reduce(addScanUsage, emptyScanUsage());
	const run = async (pass: InboxScanPass) => {
		const slot = runs.push(emptyScanUsage()) - 1;
		const result = await runInboxScanPass(adapter, pass, {
			...listener,
			onUsage: (usage) => {
				runs[slot] = usage;
				listener.onUsage?.(total());
			},
		});
		runs[slot] = result.usage;
		return result;
	};

	const main = await run({
		prompt: buildInboxScanPrompt(since),
		tools: [
			"gmail.searchThreads",
			"gmail.getThread",
			"slack.search",
			"slack.readThread",
		],
	});
	const opened = new Set(main.threads.opened);
	const followUp = await scanUnopenedThreads(
		main.threads.found.filter((id) => !opened.has(id)),
		(threadIds) =>
			run({
				prompt: buildInboxThreadsPrompt(threadIds),
				tools: ["gmail.getThread"],
			}),
		listener.onEvent,
	);
	return { messages: [...main.messages, ...followUp], usage: total() };
}
