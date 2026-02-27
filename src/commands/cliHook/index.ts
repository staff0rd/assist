import { readStdin } from "../../lib/readStdin";
import { loadConfig } from "../../shared/loadConfig";
import { extractVerb } from "./extractVerb";

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
	const config = loadConfig();
	const cliReadVerbs = config.cliReadVerbs;
	if (!cliReadVerbs) return;

	// Find the matching CLI prefix (longest match first for multi-token keys like "acli jira")
	const cliKeys = Object.keys(cliReadVerbs).sort((a, b) => b.length - a.length);
	const cli = cliKeys.find(
		(key) => command === key || command.startsWith(`${key} `),
	);
	if (!cli) return;

	const readVerbs = cliReadVerbs[cli];
	if (!readVerbs || readVerbs.length === 0) return;

	const verb = extractVerb(command, readVerbs);

	if (verb && readVerbs.includes(verb)) {
		console.log(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "allow",
					permissionDecisionReason: `Read-only ${cli} command: ${verb}`,
				},
			}),
		);
	}
}
