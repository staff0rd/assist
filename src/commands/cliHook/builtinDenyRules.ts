import { loadConfig } from "../../shared/loadConfig";
import { isGhIssueApiWrite } from "./isGhIssueApiWrite";
import { isGhPullReviewApiWrite } from "./isGhPullReviewApiWrite";

type BuiltinDenyRule = {
	message: string;
	matches: (text: string) => boolean;
	enabled?: () => boolean;
};

const PATTERN_DENIES: {
	pattern: string;
	message: string;
	enabled?: () => boolean;
}[] = [
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
			"Do not run 'gh issue edit' directly. Use 'assist github issue edit <number> [-R <owner>/<repo>] [--body <body>]' instead — it opens the body in the assist web preview pane and pushes nothing back until the user approves it. When you already know the body you want, pass it with --body (--body - reads stdin) so the first preview shows your proposal; without --body the pane shows the issue's current body. To make a targeted change to the current body, run it with --fetch first, which writes that body to a working file and prints its path without opening a preview; edit the file, then re-run without --fetch so the first preview shows your revision. Run 'assist github issue edit --help' for how the working file and the preview pane fit together; it is authoritative on how approval is handled in this environment. To remove an assignee, use 'assist github issue unassign <number> [-R <owner>/<repo>] [--assignee <login>...]' (it removes you when --assignee is omitted).",
	},
	{
		pattern: "gh issue comment",
		message:
			"Do not run 'gh issue comment' directly. Use 'assist github issue comment <number> --body <body> [-R <owner>/<repo>]' instead — it validates the body before delegating to gh, and gates the comment on the user's approval itself. Run 'assist github issue comment --help' and follow its guidance to compose the body; it is authoritative on how approval is handled in this environment.",
	},
	{
		pattern: "gh pr comment",
		message:
			"Do not run 'gh pr comment' directly — it posts to the PR without the approval pane. Use 'assist github issue comment <number> --body <body> [-R <owner>/<repo>]' instead (PR numbers are issue numbers) — it validates the body before delegating to gh, and gates the comment on the user's approval itself. To reply in a review thread, use 'assist prs reply <comment-id> <body>'. Run the command's --help and follow its guidance; it is authoritative on how approval is handled in this environment.",
	},
	{
		pattern: "git commit",
		message:
			"Do not run 'git commit' directly. Use 'assist commit \"<message>\"' instead.",
	},
	{
		pattern: "npm run",
		message:
			"Do not run 'npm run' directly. Use 'assist run <name>' for a configured command, or 'assist verify' / 'assist build'. If this repo genuinely needs npm run, set cliHook.blockNpmRun to false in its assist.yml.",
		enabled: () => loadConfig().cliHook?.blockNpmRun !== false,
	},
];

const GH_ISSUE_API_MESSAGE =
	"Do not write to GitHub issues with 'gh api' (REST issue endpoints or GraphQL issue mutations) — it bypasses the content validation and the approval pane that every outward-facing issue write goes through. Use 'assist github issue create --title <title> --body <body>' to open an issue, 'assist github issue edit <number>' to rework one's body, 'assist github issue comment <number> --body <body>' to post a comment, or 'assist github issue edit-comment <comment-id> --body <body>' to amend a comment that is already posted. Each validates the content and gates it on the user's approval before anything reaches GitHub; run the command's --help for how to compose it. To remove an assignee, use 'assist github issue unassign <number> [-R <owner>/<repo>] [--assignee <login>...]' (it removes you when --assignee is omitted).";

const BRANCH_CREATION_MESSAGE =
	"Do not create branches with raw git. Use the /branch command, or 'assist branch <slug> [--jira <KEY>]' — it branches off the fresh remote default and enforces the team naming convention.";

const CLOSE_WITH_COMMENT_MESSAGE =
	"Do not post a comment through 'gh issue close', 'gh issue reopen' or 'gh pr close' with --comment/-c — it goes to GitHub without the approval pane. Post the comment first with 'assist github issue comment <number> --body <body> [-R <owner>/<repo>]', which validates it and gates it on the user's approval, then run the same close/reopen without --comment.";

const CLOSE_WITH_COMMENT_REGEX =
	/gh (?:issue (?:close|reopen)|pr close)[^;&|]*? (?:--comment|-c)/;

const PR_REVIEW_MESSAGE =
	"Do not run 'gh pr review' with a body or a verdict (--comment, --approve, --request-changes) — it posts to the PR without the approval pane. To reply on the PR conversation, use 'assist github issue comment <number> --body <body> [-R <owner>/<repo>]' (PR numbers are issue numbers); to reply in a review thread, use 'assist prs reply <comment-id> <body>'; to add a line comment to the pending review, use 'assist prs comment <path> <line> <body>'. Each gates the text on the user's approval. Leave approving or requesting changes to the user.";

const PR_REVIEW_REGEX =
	/gh pr review[^;&|]*? (?:-[bcaFr]\b|--(?:body|body-file|comment|approve|request-changes)\b)/;

const GH_PULL_REVIEW_API_MESSAGE =
	"Do not write to pull request comments or reviews with 'gh api' — it bypasses the content validation and the approval pane. Use 'assist github issue comment <number> --body <body>' for a PR conversation comment (PR numbers are issue numbers), 'assist prs reply <comment-id> <body>' to reply in a review thread, or 'assist prs comment <path> <line> <body>' to add a line comment to the pending review. Each gates the text on the user's approval before anything reaches GitHub.";

const BRANCH_CREATION_REGEXES: RegExp[] = [
	/git (?:checkout|co) -[bB]/,
	/git switch (?:-[cC]|--create)/,
	/git branch [^-\s;&|)]/,
];

export const builtinDenyRules: BuiltinDenyRule[] = [
	...PATTERN_DENIES.map((rule) => ({
		message: rule.message,
		matches: (text: string) => text.includes(rule.pattern),
		enabled: rule.enabled,
	})),
	...BRANCH_CREATION_REGEXES.map((regex) => ({
		message: BRANCH_CREATION_MESSAGE,
		matches: (text: string) => regex.test(text),
	})),
	{
		message: CLOSE_WITH_COMMENT_MESSAGE,
		matches: (text: string) => CLOSE_WITH_COMMENT_REGEX.test(text),
	},
	{
		message: PR_REVIEW_MESSAGE,
		matches: (text: string) => PR_REVIEW_REGEX.test(text),
	},
	{
		message: GH_ISSUE_API_MESSAGE,
		matches: isGhIssueApiWrite,
	},
	{
		message: GH_PULL_REVIEW_API_MESSAGE,
		matches: isGhPullReviewApiWrite,
	},
];
