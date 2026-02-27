import { readStdin } from "../../lib/readStdin";
import { findCliRead } from "../../shared/loadCliReads";

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
	const matched = findCliRead(command);

	if (matched) {
		console.log(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "allow",
					permissionDecisionReason: `Read-only CLI command: ${matched}`,
				},
			}),
		);
	}
}
