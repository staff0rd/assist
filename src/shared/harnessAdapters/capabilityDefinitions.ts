export const capabilityDefinitions = {
	"skills.native":
		"Runs an assist skill (synced from claude/commands/) by its native invocation, e.g. `/refine a123`, so the skill's prompt loads without assist inlining it.",
	"conversation.resume":
		"Reopens an existing conversation by id with its history intact, so a daemon restart or `--resume-session` continues the same conversation instead of starting fresh.",
	"conversation.relocate":
		"Continues a conversation from a different working directory than the one it started in, so resuming a session whose worktree was reaped or replaced keeps its history in the replacement worktree.",
	"conversation.preassignId":
		"Accepts a conversation id chosen by assist at launch, so the session card binds to the conversation before the harness writes it rather than discovering the id afterwards.",
	"transcript.read":
		"Exposes the conversation's on-disk transcript as normalized events (user and assistant messages, tool calls with their operations, tool results, timestamps and turn lifecycle), so message previews, status reconciliation, restore status and transcript titles work without assist parsing the harness's format.",
	"oneShot.text":
		"Answers a single prompt headlessly and returns plain text without opening a tracked conversation, e.g. branch-name and session-title suggestions.",
	"oneShot.structured":
		"Runs a prompt from stdin headlessly in a read-only workspace, streaming tool and token-usage events and saving its final answer to a file, e.g. the code reviewers and review synthesis.",
	"usage.rateLimits":
		"Reports account rate-limit windows (5h/7d used percentage and reset time), which assist records under that harness's own usage account and shows in the status bar.",
	"tools.restrict":
		"Limits a headless run to an explicit allow-list of tools and denies every other tool, built-in shell and file tools included, so a read-only workflow such as the inbox scan cannot change anything.",
	"connector.gmail.read":
		"Searches Gmail threads and reads a thread's messages through a connector the harness can call headlessly, e.g. the inbox scan.",
	"connector.slack.read":
		"Searches Slack messages and reads a thread through a connector the harness can call headlessly, e.g. the inbox scan.",
	"intercept.command":
		"Reports every shell command (compound commands included) to assist before it runs and honours a deny, so the allowlist, restricted paths and docs/schema locks apply to commands.",
	"intercept.fileRead":
		"Reports every native file read (or reads only through intercepted shell commands) before it runs and honours a deny, so restricted paths cannot be read.",
	"intercept.fileWrite":
		"Reports every native file write or patch, with its target paths and incoming content, before it runs and honours a deny, so the docs and database schema locks hold.",
	"intercept.question":
		"Routes the harness's native question tool to the session's preview-pane form, so a question in a web session is answered from the preview pane rather than a terminal prompt it cannot drive. A harness with no native question tool has nothing to route.",
} as const;

export type CapabilityId = keyof typeof capabilityDefinitions;
