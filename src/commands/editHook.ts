import fs from "node:fs";
import { markActiveHarness } from "../lib/activeHarness";
import { readStdin } from "../lib/readStdin";
import { currentExecutionIdentity } from "../shared/currentExecutionIdentity";
import { claudeAdapter } from "../shared/harnessAdapters/claudeAdapter";
import { decideCommentGuard } from "./editHook/decideCommentGuard";
import {
	decideOverrideGuard,
	type EditHookInput,
} from "./editHook/decideOverrideGuard";
import { decideToolOperations } from "./toolPolicy/decideToolOperations";
import { logPolicyDeny } from "./toolPolicy/logPolicyDeny";

type ClaudeEditInput = EditHookInput & { session_id?: unknown };

function tryParseInput(raw: string): ClaudeEditInput | undefined {
	try {
		const data: ClaudeEditInput = JSON.parse(raw);
		if (typeof data.tool_name !== "string" || !data.tool_input)
			return undefined;
		return data;
	} catch {
		return undefined;
	}
}

function readExisting(filePath: string | undefined): string | undefined {
	if (!filePath) return undefined;
	try {
		return fs.readFileSync(filePath, "utf8");
	} catch {
		return undefined;
	}
}

async function decidePolicy(
	input: ClaudeEditInput,
): Promise<string | undefined> {
	const operations = claudeAdapter.toolOperations({
		toolName: input.tool_name,
		toolInput: input.tool_input,
	});
	const identity = currentExecutionIdentity(
		typeof input.session_id === "string" ? input.session_id : undefined,
	);
	const decision = await decideToolOperations(operations, identity);
	logPolicyDeny(operations, decision, identity);
	return decision?.permissionDecision === "deny"
		? decision.permissionDecisionReason
		: undefined;
}

export async function editHook(): Promise<void> {
	markActiveHarness("claude");
	const input = tryParseInput(await readStdin());
	if (!input) return;

	const existing = readExisting(input.tool_input.file_path);

	const reason =
		decideOverrideGuard(input, existing) ??
		decideCommentGuard(input, existing) ??
		(await decidePolicy(input));
	if (!reason) return;

	console.log(
		JSON.stringify({
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				permissionDecision: "deny",
				permissionDecisionReason: reason,
			},
		}),
	);
}
