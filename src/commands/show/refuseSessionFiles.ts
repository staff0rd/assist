import { homedir } from "node:os";
import { activeHarness } from "../../lib/activeHarness";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import { targetConversationEvents } from "../sessions/shared/targetConversationEvents";
import { findShownSessionFiles } from "./findShownSessionFiles";
import { sessionWrittenPaths } from "./sessionWrittenPaths";

export async function refuseSessionFiles(body: string): Promise<void> {
	const harness = activeHarness();
	const conversationId = harness
		? harnessAdapter(harness).conversation.current()
		: undefined;
	if (!conversationId) return;
	const events = await targetConversationEvents(process.cwd(), {
		conversationId,
		harness,
	});
	const shown = findShownSessionFiles(body, sessionWrittenPaths(events), {
		home: homedir(),
		cwd: process.cwd(),
	});
	if (shown.length === 0) return;
	console.error(
		[
			"Error: refusing to show files this session created or edited; the user already sees them in the session's diff:",
			...shown.map((path) => `  ${path}`),
			"Remove them (and any label or folder entry that exists only for them) and re-run, or skip the show if nothing is left.",
		].join("\n"),
	);
	process.exit(1);
}
