import { isGhIssueApiWrite } from "./isGhIssueApiWrite";

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
			"Do not run 'gh pr create' directly. Use 'assist prs raise --title <title> --what <what> --why <why>' instead — it assembles and validates the body before delegating to gh, and gates the PR on the user's approval itself. Run 'assist prs raise --help' and follow its guidance to compose the sections; it is authoritative on how approval is handled in this environment.",
	},
	{
		pattern: "gh pr edit",
		message:
			"Do not run 'gh pr edit' directly. Use 'assist prs edit [--title <title>] [--what <what>] [--why <why>] [--how <how>]' instead — it assembles and validates the body before delegating to gh, and in an assist web session blocks on the preview pane until the user approves or rejects. Compose the sections and run it; see 'assist prs edit --help' for how to pitch each section.",
	},
	{
		pattern: "gh issue create",
		message:
			"Do not run 'gh issue create' directly. Use 'assist github issue create --title <title> --body <body> [-R <owner>/<repo>]' instead — it validates the title and body before delegating to gh, and gates the issue on the user's approval itself. Run 'assist github issue create --help' and follow its guidance to compose the body; it is authoritative on how approval is handled in this environment.",
	},
	{
		pattern: "gh issue edit",
		message:
			"Do not run 'gh issue edit' directly. Use 'assist github issue edit <number> [-R <owner>/<repo>]' instead — it fetches the issue's current body, opens it in the assist web preview pane, and pushes nothing back until the user approves it. Run 'assist github issue edit --help' for how the working file and the preview pane fit together; it is authoritative on how approval is handled in this environment.",
	},
	{
		pattern: "gh issue comment",
		message:
			"Do not run 'gh issue comment' directly. Use 'assist github issue comment <number> --body <body> [-R <owner>/<repo>]' instead — it validates the body before delegating to gh, and gates the comment on the user's approval itself. Run 'assist github issue comment --help' and follow its guidance to compose the body; it is authoritative on how approval is handled in this environment.",
	},
	{
		pattern: "git commit",
		message:
			"Do not run 'git commit' directly. Use 'assist commit \"<message>\"' instead.",
	},
];

const GH_ISSUE_API_MESSAGE =
	"Do not write to GitHub issue endpoints with 'gh api' — it bypasses the content validation and the approval pane that every outward-facing issue write goes through. Use 'assist github issue create --title <title> --body <body>' to open an issue, 'assist github issue edit <number>' to rework one's body, 'assist github issue comment <number> --body <body>' to post a comment, or 'assist github issue edit-comment <comment-id> --body <body>' to amend a comment that is already posted. Each validates the content and gates it on the user's approval before anything reaches GitHub; run the command's --help for how to compose it.";

const BRANCH_CREATION_MESSAGE =
	"Do not create branches with raw git. Use the /branch command, or 'assist branch <slug> [--jira <KEY>]' — it branches off the fresh remote default and enforces the team naming convention.";

const COMMAND_BOUNDARY = String.raw`(?<=(?:^|[;&|(\n])\s*)`;

const BRANCH_CREATION_REGEXES: RegExp[] = [
	new RegExp(
		COMMAND_BOUNDARY + String.raw`git\s+(?:checkout|co)\s+-[bB](?=\s|$)`,
	),
	new RegExp(
		COMMAND_BOUNDARY + String.raw`git\s+switch\s+(?:-[cC]|--create)(?=\s|$)`,
	),
	new RegExp(COMMAND_BOUNDARY + String.raw`git\s+branch\s+(?!-)\S`),
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
	...BUILTIN_DENIES.map((rule) => {
		const regex = rawDenyRegex(rule.pattern);
		return {
			message: rule.message,
			matches: (text: string) => regex.test(text),
		};
	}),
	...BRANCH_CREATION_REGEXES.map((regex) => ({
		message: BRANCH_CREATION_MESSAGE,
		matches: (text: string) => regex.test(text),
	})),
	{
		message: GH_ISSUE_API_MESSAGE,
		matches: isGhIssueApiWrite,
	},
];

function matchBuiltinDeny(text: string) {
	return RAW_BUILTIN_DENIES.find((rule) => rule.matches(text));
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
