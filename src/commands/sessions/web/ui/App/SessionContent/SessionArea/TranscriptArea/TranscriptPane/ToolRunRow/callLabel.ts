import { baseName } from "./baseName";
import { EDIT_TOOLS } from "./summariseToolRun";

const SHORT = 60;

export function callLabel(call: {
	tool: string;
	target: string;
	description?: string;
}): string {
	const target = call.target.trim();
	if (call.description) return call.description;
	if (target && (call.tool === "Read" || EDIT_TOOLS.has(call.tool)))
		return call.tool === "apply_patch" ? target : baseName(target);
	const line = target.split("\n")[0];
	return line.length > SHORT || line !== target
		? `${line.slice(0, SHORT)}…`
		: line;
}
