import { addScanUsage } from "./addScanUsage";
import { buildInboxScanPrompt } from "./buildInboxScanPrompt";
import { buildInboxThreadsPrompt } from "./buildInboxThreadsPrompt";
import { emptyScanUsage } from "./emptyScanUsage";
import type { InboxScanListener, InboxScanUsage } from "./InboxScanEvent";
import type { FlaggedMessage } from "./inboxScanSchema";
import { inboxScanTools } from "./inboxScanTools";
import { type InboxScanPass, runInboxScanClaude } from "./runInboxScanClaude";
import { scanUnopenedThreads } from "./scanUnopenedThreads";

export type InboxScanOutput = {
	messages: FlaggedMessage[];
	usage: InboxScanUsage;
};

export async function scanInboxWithCoverage(
	since: Date,
	listener: InboxScanListener,
): Promise<InboxScanOutput> {
	const runs: InboxScanUsage[] = [];
	const total = () => runs.reduce(addScanUsage, emptyScanUsage());
	const run = (pass: InboxScanPass) => {
		const slot = runs.push(emptyScanUsage()) - 1;
		return runInboxScanClaude(pass, {
			...listener,
			onUsage: (usage) => {
				runs[slot] = usage;
				listener.onUsage?.(total());
			},
		});
	};

	const main = await run({
		prompt: buildInboxScanPrompt(since),
		allowedTools: inboxScanTools.allowed,
	});
	const opened = new Set(main.threads.opened);
	const followUp = await scanUnopenedThreads(
		main.threads.found.filter((id) => !opened.has(id)),
		(threadIds) =>
			run({
				prompt: buildInboxThreadsPrompt(threadIds),
				allowedTools: [inboxScanTools.gmailGetThread],
			}),
		listener.onEvent,
	);
	return { messages: [...main.messages, ...followUp], usage: total() };
}
