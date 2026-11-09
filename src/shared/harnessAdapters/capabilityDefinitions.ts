export const capabilityDefinitions = {
	"skills.native":
		"Runs an assist skill (synced from claude/commands/) by its native invocation, e.g. `/refine a123`, so the skill's prompt loads without assist inlining it.",
	"conversation.resume":
		"Reopens an existing conversation by id with its history intact, so a daemon restart or `--resume-session` continues the same conversation instead of starting fresh.",
	"conversation.preassignId":
		"Accepts a conversation id chosen by assist at launch, so the session card binds to the conversation before the harness writes it rather than discovering the id afterwards.",
} as const;

export type CapabilityId = keyof typeof capabilityDefinitions;
