export type UntruncatableRead = {
	prefix: string;
	reason: string;
	filters: string[];
};

export const TRUNCATOR_BINARIES = ["head", "tail"];

const NARROWING_FILTERS = [...TRUNCATOR_BINARIES, "grep", "rg", "wc"];

function backlogRead(prefix: string): UntruncatableRead {
	return {
		prefix,
		filters: TRUNCATOR_BINARIES,
		reason: `Plan, Activity and Comments print at the end of the output, so a truncated read drops them and leaves you assuming the item has none. Run '${prefix} <id>' bare and read all of it, or use a focused view: 'assist backlog comments <id>' for comments only.`,
	};
}

const UNTRUNCATABLE_READS: UntruncatableRead[] = [
	backlogRead("assist backlog show"),
	backlogRead("assist backlog view"),
	{
		prefix: "assist verify",
		filters: NARROWING_FILTERS,
		reason:
			"Verify already prints only what failed — under CLAUDECODE it suppresses every passing check — so there is nothing to trim or search for and a narrowed read drops the failing check's output, the only part worth reading, leaving you guessing at the failure. Run 'assist verify' bare and read all of it.",
	},
	{
		prefix: "assist prs list-comments",
		filters: TRUNCATOR_BINARIES,
		reason:
			"Every unresolved thread prints in full above the resolved index, with its author, path:line, id, url and body, so a truncated read leaves you the one-line resolved index instead of the threads. Run 'assist prs list-comments' bare and read all of it — do not read or parse the YAML cache; fixed, wontfix and reply locate it themselves.",
	},
];

const APPROVAL_GATED_COMMANDS = [
	"assist backlog propose",
	"assist backlog comment",
	"assist backlog update-plan",
	"assist backlog add-phase",
	"assist github issue create",
	"assist github issue edit",
	"assist github issue comment",
	"assist github issue edit-comment",
	"assist slack post",
	"assist prs raise",
	"assist prs edit",
	"assist prs comment",
	"assist prs reply",
	"assist prs wontfix",
	"assist prs review-reply",
	"assist miro extract",
];

function hasPrefix(prefix: string, part: string): boolean {
	return part === prefix || part.startsWith(`${prefix} `);
}

export function matchUntruncatableRead(
	part: string,
): UntruncatableRead | undefined {
	return UNTRUNCATABLE_READS.find((entry) => hasPrefix(entry.prefix, part));
}

export function matchApprovalGatedCommand(part: string): string | undefined {
	return APPROVAL_GATED_COMMANDS.find((prefix) => hasPrefix(prefix, part));
}
