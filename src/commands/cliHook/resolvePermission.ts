import { isApprovedRead } from "../../shared/isApprovedRead";
import { matchesDeny } from "../../shared/matchesAllow";
import { matchesConfigDeny } from "../../shared/matchesConfigDeny";

type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

export function findDeny(
	toolName: string,
	parts: string[],
): HookDecision | undefined {
	for (const part of parts) {
		const configDeny = matchesConfigDeny(part);
		if (configDeny) {
			return {
				permissionDecision: "deny",
				permissionDecisionReason: configDeny.message,
			};
		}
	}

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
