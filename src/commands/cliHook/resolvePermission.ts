import { isApprovedRead } from "../../shared/isApprovedRead";
import { matchesDeny } from "../../shared/matchesAllow";
import { matchesConfigDeny } from "../../shared/matchesConfigDeny";
import { findBuiltinDeny } from "./findBuiltinDeny";

export type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

/**
 * Read commands that have focused sub-commands producing targeted output.
 * When wrapped in a compound command (e.g. piped through grep/sed), the hook
 * denies with an advisory message steering the caller to a bare sub-command
 * instead, rather than letting it fall through to a permission prompt.
 */
const SUBCOMMAND_READS: { prefix: string; subcommands: string[] }[] = [
	{
		prefix: "assist complexity",
		subcommands: ["maintainability", "cyclomatic", "halstead"],
	},
];

function matchesSubcommandRead(part: string) {
	return SUBCOMMAND_READS.find(
		(rule) => part === rule.prefix || part.startsWith(`${rule.prefix} `),
	);
}

/**
 * When a command has multiple parts (compound) and one is a read command with
 * focused sub-commands, deny with advice to run the bare sub-command directly.
 */
function findSubcommandAdvice(parts: string[]): HookDecision | undefined {
	if (parts.length <= 1) return undefined;

	for (const part of parts) {
		const rule = matchesSubcommandRead(part);
		if (rule) {
			return {
				permissionDecision: "deny",
				permissionDecisionReason: `Do not pipe or chain '${rule.prefix}'. Run a focused sub-command directly for targeted output: ${rule.subcommands
					.map((s) => `${rule.prefix} ${s} <file>`)
					.join(", ")}.`,
			};
		}
	}

	return undefined;
}

export function findDeny(
	toolName: string,
	parts: string[],
): HookDecision | undefined {
	const builtinDeny = findBuiltinDeny(parts);
	if (builtinDeny) return builtinDeny;

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
