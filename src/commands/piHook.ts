import { markActiveHarness } from "../lib/activeHarness";
import { readStdin } from "../lib/readStdin";
import { currentExecutionIdentity } from "../shared/currentExecutionIdentity";
import type { NativeToolCall } from "../shared/harnessAdapters/types";
import { piAdapter } from "../shared/harnessAdapters/piAdapter";
import { decideToolOperations } from "./toolPolicy/decideToolOperations";
import { logPolicyDeny } from "./toolPolicy/logPolicyDeny";

type PiHookInput = {
	toolName?: unknown;
	command?: unknown;
	input?: unknown;
};

function parseInput(raw: string): NativeToolCall | undefined {
	try {
		const data: PiHookInput = JSON.parse(raw);
		const toolName = typeof data.toolName === "string" ? data.toolName : "bash";
		const toolInput =
			data.input && typeof data.input === "object"
				? (data.input as Record<string, unknown>)
				: { command: data.command };
		return { toolName, toolInput };
	} catch {
		return undefined;
	}
}

export async function piHook(): Promise<void> {
	markActiveHarness("pi");
	const call = parseInput(await readStdin());
	if (!call) return;
	const operations = piAdapter.toolOperations(call);
	if (operations.length === 0) return;

	const identity = currentExecutionIdentity();
	const decision = await decideToolOperations(operations, identity);
	logPolicyDeny(operations, decision, identity);
	const output = decision
		? {
				decision: decision.permissionDecision,
				reason: decision.permissionDecisionReason,
			}
		: { decision: operations[0].kind === "command" ? "gate" : "allow" };

	console.log(JSON.stringify(output));
}
