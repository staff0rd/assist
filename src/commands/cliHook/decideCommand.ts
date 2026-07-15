import { splitCompound } from "../../shared/splitCompound";
import { findBuiltinDenyRaw } from "./findBuiltinDeny";
import {
	findDeny,
	type HookDecision,
	resolvePermission,
} from "./resolvePermission";

export function decideCommand(
	toolName: string,
	rawCommand: string,
): HookDecision | undefined {
	const result = splitCompound(rawCommand);
	if (result.ok) return resolvePermission(toolName, result.parts);
	return findBuiltinDenyRaw(rawCommand) ?? findDeny(toolName, [rawCommand]);
}
