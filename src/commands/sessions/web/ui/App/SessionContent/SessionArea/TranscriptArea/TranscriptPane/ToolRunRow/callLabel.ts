import { baseName } from "./baseName";
import { commandPrograms } from "./commandPrograms";
import { EDIT_TOOLS } from "./summariseToolRun";

const SHORT = 40;
const SHELL_TOOLS = new Set(["Bash", "exec_command", "shell", "local_shell"]);

export function callLabel(call: {
	tool: string;
	target: string;
	description?: string;
}): string {
	const target = call.target.trim();
	if (call.description) return call.description;
	if (target && (call.tool === "Read" || EDIT_TOOLS.has(call.tool)))
		return call.tool === "apply_patch" ? target : baseName(target);
	if (SHELL_TOOLS.has(call.tool)) return commandPrograms(target);
	const line = target.split("\n")[0];
	return line.length > SHORT || line !== target
		? `${line.slice(0, SHORT)}…`
		: line;
}
