import { baseName } from "./baseName";
import { commandPrograms } from "./commandPrograms";
import { isUrlTarget } from "./isUrlTarget";

const SHORT = 40;
const EDIT_TOOLS = new Set([
	"Edit",
	"MultiEdit",
	"Write",
	"NotebookEdit",
	"apply_patch",
]);
const SHELL_TOOLS = new Set(["Bash", "exec_command", "shell", "local_shell"]);

export function callLabel(call: {
	tool: string;
	target: string;
	description?: string;
}): string {
	const target = call.target.trim();
	if (call.description) return call.description;
	if (isUrlTarget(target)) return target;
	if (target && (call.tool === "Read" || EDIT_TOOLS.has(call.tool)))
		return call.tool === "apply_patch" ? target : baseName(target);
	if (SHELL_TOOLS.has(call.tool)) return commandPrograms(target);
	const line = target.split("\n")[0];
	return line.length > SHORT || line !== target
		? `${line.slice(0, SHORT)}…`
		: line;
}
