type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

/**
 * Commands denied regardless of settings or per-project config, each
 * redirecting to an assist wrapper that validates before delegating.
 */
const BUILTIN_DENIES: { pattern: string; message: string }[] = [
	{
		pattern: "gh pr create",
		message:
			"Do not run 'gh pr create' directly. Use 'assist prs raise --title <title> --what <what> --why <why>' instead — it assembles and validates the body before delegating to gh. Before running it, get explicit approval via the AskUserQuestion tool, regardless of permission mode, with the full proposed title and body in the approve option's preview field so the user actually sees them.",
	},
	{
		pattern: "git commit",
		message:
			"Do not run 'git commit' directly. Use 'assist commit \"<message>\"' instead.",
	},
];

function matchesBuiltinDeny(part: string) {
	return BUILTIN_DENIES.find(
		(rule) => part === rule.pattern || part.startsWith(`${rule.pattern} `),
	);
}

export function findBuiltinDeny(parts: string[]): HookDecision | undefined {
	const rule = parts.map(matchesBuiltinDeny).find(Boolean);
	if (!rule) return undefined;

	return {
		permissionDecision: "deny",
		permissionDecisionReason: rule.message,
	};
}
