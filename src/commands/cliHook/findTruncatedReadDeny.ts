type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

const UNTRUNCATABLE_READS = ["assist backlog show", "assist backlog view"];

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

function matchPrefix(prefixes: string[], part: string): string | undefined {
	return prefixes.find(
		(prefix) => part === prefix || part.startsWith(`${prefix} `),
	);
}

function startsWithTruncator(part: string): boolean {
	const binary = part.split(/\s+/)[0]?.split("/").pop() ?? "";
	return TRUNCATOR_BINARIES.includes(binary);
}

function toDecision(
	read: string | undefined,
	gated: string | undefined,
): HookDecision | undefined {
	if (read)
		return {
			permissionDecision: "deny",
			permissionDecisionReason: `Do not pipe '${read}' through head or tail. Plan, Activity and Comments print at the end of the output, so a truncated read drops them and leaves you assuming the item has none. Run '${read} <id>' bare and read all of it, or use a focused view: 'assist backlog comments <id>' for comments only.`,
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
		parts.map((part) => matchPrefix(UNTRUNCATABLE_READS, part)).find(Boolean),
		parts
			.map((part) => matchPrefix(APPROVAL_GATED_COMMANDS, part))
			.find(Boolean),
	);
}

export function findTruncatedReadDenyRaw(
	rawCommand: string,
): HookDecision | undefined {
	if (!startsWithTruncator(rawCommand) && !PIPED_TRUNCATOR_RE.test(rawCommand))
		return undefined;

	return toDecision(
		matchPrefix(UNTRUNCATABLE_READS, rawCommand),
		matchPrefix(APPROVAL_GATED_COMMANDS, rawCommand),
	);
}
