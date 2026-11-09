export const capabilityDefinitions = {
	"skills.native":
		"Runs an assist skill (synced from claude/commands/) by its native invocation, e.g. `/refine a123`, so the skill's prompt loads without assist inlining it.",
	"conversation.resume":
		"Reopens an existing conversation by id with its history intact, so a daemon restart or `--resume-session` continues the same conversation instead of starting fresh.",
	"conversation.preassignId":
		"Accepts a conversation id chosen by assist at launch, so the session card binds to the conversation before the harness writes it rather than discovering the id afterwards.",
	"oneShot.text":
		"Answers a single prompt headlessly and returns plain text without opening a tracked conversation, e.g. branch-name and session-title suggestions.",
	"oneShot.structured":
		"Runs a prompt from stdin headlessly in a read-only workspace, streaming tool and token-usage events and saving its final answer to a file, e.g. the code reviewers and review synthesis.",
	"usage.rateLimits":
		"Reports account rate-limit windows (5h/7d used percentage and reset time), which assist records under that harness's own usage account and shows in the status bar.",
} as const;

export type CapabilityId = keyof typeof capabilityDefinitions;
