type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

type UntruncatableRead = { prefix: string; reason: string };

function backlogRead(prefix: string): UntruncatableRead {
	return {
		prefix,
		reason: `Plan, Activity and Comments print at the end of the output, so a truncated read drops them and leaves you assuming the item has none. Run '${prefix} <id>' bare and read all of it, or use a focused view: 'assist backlog comments <id>' for comments only.`,
	};
}

const UNTRUNCATABLE_READS: UntruncatableRead[] = [
	backlogRead("assist backlog show"),
	backlogRead("assist backlog view"),
	{
		prefix: "assist prs list-comments",
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
	"assist miro extract",
];

const TRUNCATOR_BINARIES = ["head", "tail"];

const PIPED_TRUNCATOR_RE = /\|\s*(?:\S*\/)?(?:head|tail)\b/;

function hasPrefix(prefix: string, part: string): boolean {
	return part === prefix || part.startsWith(`${prefix} `);
}

function matchRead(part: string): UntruncatableRead | undefined {
	return UNTRUNCATABLE_READS.find((entry) => hasPrefix(entry.prefix, part));
}

function matchGated(part: string): string | undefined {
	return APPROVAL_GATED_COMMANDS.find((prefix) => hasPrefix(prefix, part));
}

function startsWithTruncator(part: string): boolean {
	const binary = part.split(/\s+/)[0]?.split("/").pop() ?? "";
	return TRUNCATOR_BINARIES.includes(binary);
}

function toDecision(
	read: UntruncatableRead | undefined,
	gated: string | undefined,
): HookDecision | undefined {
	if (read)
		return {
			permissionDecision: "deny",
			permissionDecisionReason: `Do not pipe '${read.prefix}' through head or tail. ${read.reason}`,
		};

	if (gated)
		return {
			permissionDecision: "deny",
			permissionDecisionReason: `Do not pipe '${gated}' through head or tail. It gates on a preview the reviewer can reject with inline comments, and those comments print at the end of the output. Nothing persists them, so a truncated read discards the reviewer's feedback for good and they have to retype it. Run '${gated}' bare and read all of it.`,
		};

	return undefined;
}

export function findTruncatedReadDeny(
	parts: string[],
): HookDecision | undefined {
	if (!parts.some(startsWithTruncator)) return undefined;

	return toDecision(
		parts.map(matchRead).find(Boolean),
		parts.map(matchGated).find(Boolean),
	);
}

export function findTruncatedReadDenyRaw(
	rawCommand: string,
): HookDecision | undefined {
	if (!startsWithTruncator(rawCommand) && !PIPED_TRUNCATOR_RE.test(rawCommand))
		return undefined;

	return toDecision(matchRead(rawCommand), matchGated(rawCommand));
}
