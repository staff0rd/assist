import { readStdin } from "../../lib/readStdin";
import { isApprovedRead } from "../../shared/isApprovedRead";
import { matchesDeny } from "../../shared/matchesAllow";
import { matchesConfigDeny } from "../../shared/matchesConfigDeny";
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

function findDeny(toolName: string, parts: string[]): HookDecision | undefined {
	for (const part of parts) {
		const configDeny = matchesConfigDeny(part);
		if (configDeny) {
			return {
				permissionDecision: "deny",
				permissionDecisionReason: configDeny.message,
			};
		}
	}

	for (const part of parts) {
		const denied = matchesDeny(toolName, part);
		if (denied) {
			return {
				permissionDecision: "deny",
				permissionDecisionReason: `Denied by settings: ${denied}`,
			};
		}
	}

	return undefined;
}

function resolvePermission(
	toolName: string,
	parts: string[],
): HookDecision | undefined {
	const denied = findDeny(toolName, parts);
	if (denied) return denied;

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

function tryParseJson(raw: string): HookInput | undefined {
	try {
		return JSON.parse(raw);
	} catch {
		return undefined;
	}
}

function extractCommand(
	data: HookInput,
): { toolName: string; parts: string[] } | undefined {
	if (!SUPPORTED_TOOLS.has(data.tool_name) || !data.tool_input?.command)
		return undefined;
	const parts = splitCompound(data.tool_input.command.trim());
	return parts ? { toolName: data.tool_name, parts } : undefined;
}

export async function cliHook(): Promise<void> {
	const data = tryParseJson(await readStdin());
	if (!data) return;
	const cmd = extractCommand(data);
	if (!cmd) return;

	const decision = resolvePermission(cmd.toolName, cmd.parts);
	if (!decision) return;

	console.log(
		JSON.stringify({
			hookSpecificOutput: { hookEventName: "PreToolUse", ...decision },
		}),
	);
}
