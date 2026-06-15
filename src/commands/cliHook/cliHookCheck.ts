import { isApprovedRead } from "../../shared/isApprovedRead";
import { splitCompound } from "../../shared/splitCompound";
import { findBuiltinDenyRaw } from "./findBuiltinDeny";
import { findDeny } from "./resolvePermission";

function reportDecision(decision: ReturnType<typeof findDeny>): boolean {
	if (!decision) return false;

	console.log(`denied: ${decision.permissionDecisionReason}`);
	process.exitCode = 1;
	return true;
}

function reportDeny(toolName: string, parts: string[]): boolean {
	return reportDecision(findDeny(toolName, parts));
}

export function cliHookCheck(command: string, toolName = "Bash"): void {
	const trimmed = command.trim();
	const result = splitCompound(trimmed);

	if (!result.ok) {
		if (reportDecision(findBuiltinDenyRaw(trimmed))) return;
		if (reportDeny(toolName, [trimmed])) return;
		console.log(`not approved (${result.error})`);
		process.exitCode = 1;
		return;
	}

	const parts = result.parts;
	if (reportDeny(toolName, parts)) return;

	const reasons: string[] = [];
	for (const part of parts) {
		const reason = isApprovedRead(part, toolName);
		if (!reason) {
			console.log(`not approved (unrecognised: ${part})`);
			process.exitCode = 1;
			return;
		}
		reasons.push(`  ${part} -> ${reason}`);
	}

	console.log(`approved\n${reasons.join("\n")}`);
}
