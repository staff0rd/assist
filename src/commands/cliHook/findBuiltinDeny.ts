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
		pattern: "gh pr edit",
		message:
			"Do not run 'gh pr edit' directly. Use 'assist prs edit [--title <title>] [--what <what>] [--why <why>] [--how <how>]' instead — it assembles and validates the body before delegating to gh. Before running it, get explicit approval via the AskUserQuestion tool, regardless of permission mode, with the full proposed title and body in the approve option's preview field so the user actually sees them.",
	},
	{
		pattern: "git commit",
		message:
			"Do not run 'git commit' directly. Use 'assist commit \"<message>\"' instead.",
	},
];

const BRANCH_CREATION_MESSAGE =
	"Do not create branches with raw git. Use the /branch command, or 'assist branch <slug> [--jira <KEY>]' — it branches off the fresh remote default and enforces the team naming convention.";

const BRANCH_CREATION_REGEXES: RegExp[] = [
	/(?<=^|\s)git\s+(?:checkout|co)\s+-[bB](?=\s|$)/,
	/(?<=^|\s)git\s+switch\s+(?:-[cC]|--create)(?=\s|$)/,
	/(?<=^|\s)git\s+branch\s+(?!-)\S/,
];

function rawDenyRegex(pattern: string): RegExp {
	const tokens = pattern
		.trim()
		.split(/\s+/)
		.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`))
		.join(String.raw`\s+`);
	// why: match the pattern as a whole token sequence anywhere, not only as a leading prefix
	return new RegExp(`(?<=^|\\s)${tokens}(?=\\s|$)`);
}

const RAW_BUILTIN_DENIES = [
	...BUILTIN_DENIES.map((rule) => ({
		message: rule.message,
		regex: rawDenyRegex(rule.pattern),
	})),
	...BRANCH_CREATION_REGEXES.map((regex) => ({
		message: BRANCH_CREATION_MESSAGE,
		regex,
	})),
];

function matchBuiltinDeny(text: string) {
	return RAW_BUILTIN_DENIES.find((rule) => rule.regex.test(text));
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
