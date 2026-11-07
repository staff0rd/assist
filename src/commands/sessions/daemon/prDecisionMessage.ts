const FORWARDED = [
	"reason",
	"comments",
	"screenshots",
	"body",
	"reviewAfter",
	"announceAfter",
	"draft",
	"autoMerge",
	"autostart",
	"startOn",
	"checklist",
	"reviewEvent",
	"reviewComments",
	"dismissed",
	"restart",
	"answers",
] as const;

export function prDecisionMessage(
	requestId: string,
	d: Record<string, unknown>,
): Record<string, unknown> {
	return {
		type: "pr-decision",
		requestId,
		decision: d.decision,
		...Object.fromEntries(FORWARDED.map((key) => [key, d[key]])),
	};
}
