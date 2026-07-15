import { readStdin } from "../../lib/readStdin";
import { decideCommand } from "../cliHook/decideCommand";

type PiHookInput = {
	toolName?: string;
	command?: unknown;
};

const TOOL_MAP: Record<string, string> = {
	bash: "Bash",
	powershell: "PowerShell",
};

type ParsedInput = { toolName: string; command: string };

function parseInput(raw: string): ParsedInput | undefined {
	try {
		const data: PiHookInput = JSON.parse(raw);
		const command = data.command;
		if (typeof command !== "string" || !command.trim()) return undefined;
		const toolName = TOOL_MAP[(data.toolName ?? "bash").toLowerCase()];
		if (!toolName) return undefined;
		return { toolName, command: command.trim() };
	} catch {
		return undefined;
	}
}

export async function piHook(): Promise<void> {
	const input = parseInput(await readStdin());
	if (!input) return;

	const decision = decideCommand(input.toolName, input.command);
	const output = decision
		? {
				decision: decision.permissionDecision,
				reason: decision.permissionDecisionReason,
			}
		: { decision: "gate" };

	console.log(JSON.stringify(output));
}
