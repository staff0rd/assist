import { readStdin } from "../../lib/readStdin";
import { isApprovedRead } from "../../shared/isApprovedRead";
import { matchesDeny } from "../../shared/matchesAllow";
import { splitCompound } from "../../shared/splitCompound";

type HookInput = {
	hook_event_name: string;
	tool_name: string;
	tool_input: {
		command?: string;
	};
};

type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

const SUPPORTED_TOOLS = new Set(["Bash", "PowerShell"]);

function resolvePermission(
	toolName: string,
	parts: string[],
): HookDecision | undefined {
	for (const part of parts) {
		const denied = matchesDeny(toolName, part);
		if (denied) {
			return {
				permissionDecision: "deny",
				permissionDecisionReason: `Denied by settings: ${denied}`,
			};
		}
	}

	const reasons: string[] = [];
	for (const part of parts) {
		const reason = isApprovedRead(part, toolName);
		if (!reason) return undefined;
		reasons.push(reason);
	}

	return {
		permissionDecision: "allow",
		permissionDecisionReason: reasons.join("; "),
	};
}

export async function cliHook(): Promise<void> {
	const inputData = await readStdin();

	let data: HookInput;
	try {
		data = JSON.parse(inputData);
	} catch {
		return;
	}

	if (!SUPPORTED_TOOLS.has(data.tool_name) || !data.tool_input?.command) {
		return;
	}

	const parts = splitCompound(data.tool_input.command.trim());
	if (!parts) return;

	const decision = resolvePermission(data.tool_name, parts);
	if (!decision) return;

	console.log(
		JSON.stringify({
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				...decision,
			},
		}),
	);
}
