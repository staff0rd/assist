import { readStdin } from "../../lib/readStdin";
import { isApprovedRead } from "../../shared/isApprovedRead";
import { splitCompound } from "../../shared/splitCompound";

type HookInput = {
	hook_event_name: string;
	tool_name: string;
	tool_input: {
		command?: string;
	};
};

export async function cliHook(): Promise<void> {
	const inputData = await readStdin();

	let data: HookInput;
	try {
		data = JSON.parse(inputData);
	} catch {
		return;
	}

	if (data.tool_name !== "Bash" || !data.tool_input?.command) {
		return;
	}

	const command = data.tool_input.command.trim();
	const parts = splitCompound(command);
	if (!parts) return;

	const reasons: string[] = [];
	for (const part of parts) {
		const reason = isApprovedRead(part);
		if (!reason) return; // unknown sub-command — fall through
		reasons.push(reason);
	}

	console.log(
		JSON.stringify({
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				permissionDecision: "allow",
				permissionDecisionReason: reasons.join("; "),
			},
		}),
	);
}
