import { builtinDenyRules } from "./builtinDenyRules";
import { extractNestedCommands } from "./extractNestedCommands";

type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

function matchBuiltinDeny(text: string) {
	const commands = [text, ...extractNestedCommands(text)];
	return builtinDenyRules.find(
		(rule) =>
			commands.some((command) => rule.matches(command)) &&
			(rule.enabled?.() ?? true),
	);
}

function toDecision(
	rule: { message: string } | undefined,
): HookDecision | undefined {
	if (!rule) return undefined;

	return {
		permissionDecision: "deny",
		permissionDecisionReason: rule.message,
	};
}

export function findBuiltinDeny(parts: string[]): HookDecision | undefined {
	for (const part of parts) {
		const decision = toDecision(matchBuiltinDeny(part));
		if (decision) return decision;
	}
	return undefined;
}

export function findBuiltinDenyRaw(
	rawCommand: string,
): HookDecision | undefined {
	return toDecision(matchBuiltinDeny(rawCommand));
}
