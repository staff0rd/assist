import { isApprovedRead } from "../../shared/isApprovedRead";
import { matchesDeny } from "../../shared/matchesAllow";
import { matchesConfigDeny } from "../../shared/matchesConfigDeny";
import { findBuiltinDeny } from "./findBuiltinDeny";
import { findRestrictedPathDeny } from "./findRestrictedPathDeny";
import { findTruncatedReadDeny } from "./findTruncatedReadDeny";
import { findSubcommandAdvice } from "./findSubcommandAdvice";

export type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

export function findDeny(
	toolName: string,
	parts: string[],
): HookDecision | undefined {
	const restrictedPathDeny = findRestrictedPathDeny(parts);
	if (restrictedPathDeny) return restrictedPathDeny;

	const builtinDeny = findBuiltinDeny(parts);
	if (builtinDeny) return builtinDeny;

	const truncatedRead = findTruncatedReadDeny(parts);
	if (truncatedRead) return truncatedRead;

	for (const part of parts) {
		const configDeny = matchesConfigDeny(part);
		if (configDeny) {
			return {
				permissionDecision: "deny",
				permissionDecisionReason: configDeny.message,
			};
		}
	}

	const subcommandAdvice = findSubcommandAdvice(parts);
	if (subcommandAdvice) return subcommandAdvice;

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

export function resolvePermission(
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
