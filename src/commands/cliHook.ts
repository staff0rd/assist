import { markActiveHarness } from "../lib/activeHarness";
import { readStdin } from "../lib/readStdin";
import { currentExecutionIdentity } from "../shared/currentExecutionIdentity";
import { claudeAdapter } from "../shared/harnessAdapters/claudeAdapter";
import { tryParseInput } from "./cliHook/tryParseInput";
import { decideToolOperations } from "./toolPolicy/decideToolOperations";
import { logPolicyDeny } from "./toolPolicy/logPolicyDeny";

export async function cliHook(): Promise<void> {
	markActiveHarness("claude");
	const input = tryParseInput(await readStdin());
	if (!input) return;

	const operations = claudeAdapter.toolOperations(input);
	const identity = currentExecutionIdentity(input.sessionId);
	const decision = await decideToolOperations(operations, identity);
	if (!decision) return;

	console.log(
		JSON.stringify({
			hookSpecificOutput: { hookEventName: "PreToolUse", ...decision },
		}),
	);
	logPolicyDeny(operations, decision, identity);
}
