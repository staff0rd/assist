import type { HarnessKind } from "../harnesses";
import type { CapabilityDeclarations } from "./types";
import { supported, unsupported } from "./unsupported";

const claude: CapabilityDeclarations = {
	"skills.native": supported,
	"launch.terminal": supported,
	"conversation.resume": supported,
	"conversation.relocate": supported,
	"conversation.id": supported,
	"conversation.preassignId": supported,
	"systemPrompt.append": supported,
	"tasks.notifyOnExit": supported,
	"preview.nextTurn": supported,
	"artifacts.publish": supported,
	"transcript.read": supported,
	"oneShot.text": supported,
	"oneShot.structured": supported,
	"usage.rateLimits": supported,
	"tools.restrict": supported,
	"connector.gmail.read": supported,
	"connector.slack.read": supported,
	"intercept.command": supported,
	"intercept.fileRead": supported,
	"intercept.fileWrite": supported,
	"intercept.editDiff": supported,
	"intercept.question": supported,
	"slashCommands.suggest": supported,
	"session.driven": unsupported(
		"Claude runs in a terminal the daemon mirrors rather than a session the daemon drives",
		"pick Claude (SDK) for a session driven through the Agent SDK",
	),
	"tasks.background": unsupported(
		"assist cannot list or stop the background tasks of a Claude session running in a terminal",
		"pick Claude (SDK) to see background tasks on the session card",
	),
};

const claudeSdk: CapabilityDeclarations = {
	...claude,
	"session.driven": supported,
	"tasks.background": supported,
};

const codex: CapabilityDeclarations = {
	"skills.native": supported,
	"launch.terminal": supported,
	"conversation.resume": supported,
	"conversation.relocate": supported,
	"conversation.id": supported,
	"conversation.preassignId": unsupported(
		"Codex assigns its own conversation id when its rollout starts",
		"assist binds the Codex conversation id from the rollout after launch",
	),
	"systemPrompt.append": unsupported(
		"Design launches on Codex have not passed manual testing: sessions arrived without the design prompt or stopped before designing anything",
		"start design sessions with Claude",
		"a1589",
	),
	"tasks.notifyOnExit": unsupported(
		"Codex runs a background command in an exec session that reports nothing back once the turn ends, so an agent that ends its turn never sees a command that waits on the user, such as review-high-level's verdict",
		"run the high-level review on Claude; assist ask-question, ask and ask-check hand off to the daemon, which types the decision into Codex as its next turn",
		"a1573",
	),
	"preview.nextTurn": supported,
	"artifacts.publish": unsupported(
		"Codex has no tool that publishes a claude.ai artifact, and assist ask-design reviews only artifact links",
		"design in Codex and deliver the HTML file, then review it in chat; start the design session with Claude for preview-pane review rounds",
		"a1567",
	),
	"transcript.read": supported,
	"oneShot.text": supported,
	"oneShot.structured": supported,
	"usage.rateLimits": supported,
	"tools.restrict": unsupported(
		"assist cannot yet limit a headless Codex run to an allow-list of connector tools",
		"run the inbox scan with Claude (assist inbox scan --harness claude)",
		"a1562",
	),
	"connector.gmail.read": unsupported(
		"Codex has no verified read-only Gmail connector",
		"run the inbox scan with Claude (assist inbox scan --harness claude)",
		"a1562",
	),
	"connector.slack.read": unsupported(
		"Codex has no verified read-only Slack connector",
		"run the inbox scan with Claude (assist inbox scan --harness claude)",
		"a1562",
	),
	"intercept.command": supported,
	"intercept.fileRead": supported,
	"intercept.fileWrite": supported,
	"intercept.editDiff": unsupported(
		"assist's maintainability-override and comment guards run only in Claude's edit hook, so Codex patches are not checked for override markers or new code comments",
		"the shared policy still applies the allowlist, restricted paths and docs/schema locks; run work that must keep those guards on Claude",
		"a1592",
	),
	// codex-cli 0.167.1 reports request_user_input and selectable request_user_input_async via PreToolUse; captured in question fixtures and replayed through codexHook.
	"intercept.question": supported,
	"slashCommands.suggest": supported,
	"session.driven": unsupported(
		"Codex runs in a terminal the daemon mirrors rather than a session the daemon drives",
		"pick Codex (SDK) for a session driven through the Codex SDK",
	),
	"tasks.background": unsupported(
		"Codex reports no background tasks to assist",
		"Codex sessions show no background-task rows",
	),
};

export const harnessCapabilityDeclarations: Record<
	HarnessKind,
	CapabilityDeclarations
> = {
	claude,
	"claude-sdk": claudeSdk,
	codex,
	"codex-sdk": {
		...codex,
		// why: a driven session runs with ASSIST_SDK_AGENT, so a command that waits on the user defers to the daemon, which sends the decision as the next turn
		"tasks.notifyOnExit": supported,
		"session.driven": supported,
	},
	pi: {
		"skills.native": supported,
		"launch.terminal": supported,
		"conversation.resume": unsupported(
			"pi sessions cannot be resumed yet",
			"restart starts a fresh pi conversation; pick Claude or Codex to keep the conversation across restarts",
			"a696",
		),
		"conversation.relocate": unsupported(
			"pi sessions cannot be resumed, so a pi conversation cannot continue in a replacement worktree",
			"start a fresh session in the replacement worktree; pick Claude or Codex to keep the conversation across worktree replacement",
			"a696",
		),
		"conversation.id": unsupported(
			"assist records no conversation id for pi sessions",
			"comment from the session's own diff panel; a standalone /diff link cannot find a pi session",
			"a696",
		),
		"conversation.preassignId": unsupported(
			"pi does not accept a caller-assigned conversation id",
			"the session card tracks pi without a conversation id",
		),
		"systemPrompt.append": unsupported(
			"assist has not verified a pi flag that appends a system prompt at launch and on resume",
			"start design sessions with Claude or Codex, or run /design inside a pi session to read the design prompt from disk",
			"a696",
		),
		"tasks.notifyOnExit": unsupported(
			"assist has not verified a pi tool that wakes the agent when a background command exits, so an agent that ends its turn would never see a command that waits on the user, such as review-high-level's verdict or an assist ask-question answer",
			"run the high-level review on Claude; pi routes its native question tool to the preview pane instead of assist ask-question",
			"a1573",
		),
		"preview.nextTurn": unsupported(
			"assist cannot yet deliver a preview-pane decision into a pi session as its next turn, and pi cannot wait on a background task",
			"pi routes its native question tool to the preview pane instead of assist ask-question",
			"a1573",
		),
		"artifacts.publish": unsupported(
			"pi has no tool that publishes a claude.ai artifact, and assist ask-design reviews only artifact links",
			"deliver the HTML file and review it in chat; start the design session with Claude for preview-pane review rounds",
			"a1567",
		),
		"transcript.read": unsupported(
			"assist cannot read pi conversation transcripts yet",
			"pi session cards show no message previews or transcript-derived status and title; pick Claude or Codex for those",
			"a696",
		),
		"oneShot.text": unsupported(
			"assist has no headless pi one-shot yet",
			"the derived fallback is used instead (slug from the description, no generated title); set harness.engine to claude or codex for generated suggestions",
			"a696",
		),
		"oneShot.structured": unsupported(
			"assist has no headless streaming pi run yet",
			"pick Claude or Codex for review synthesis (review.synthesisHarness); pi cannot be a reviewer",
			"a696",
		),
		"usage.rateLimits": unsupported(
			"pi reports no account rate-limit windows to assist",
			"pi sessions show no usage windows; Claude and Codex usage is still tracked under their own accounts",
			"a696",
		),
		"tools.restrict": unsupported(
			"assist cannot limit a headless pi run to an allow-list of tools",
			"run the inbox scan with Claude (assist inbox scan --harness claude)",
			"a1562",
		),
		"connector.gmail.read": unsupported(
			"pi has no Gmail connector",
			"run the inbox scan with Claude (assist inbox scan --harness claude)",
			"a1562",
		),
		"connector.slack.read": unsupported(
			"pi has no Slack connector",
			"run the inbox scan with Claude (assist inbox scan --harness claude)",
			"a1562",
		),
		"intercept.command": supported,
		"intercept.fileRead": supported,
		"intercept.fileWrite": supported,
		"intercept.editDiff": unsupported(
			"assist's maintainability-override and comment guards run only in Claude's edit hook, so pi edits and writes are not checked for override markers or new code comments",
			"the shared policy still applies the allowlist, restricted paths and docs/schema locks; run work that must keep those guards on Claude",
			"a1592",
		),
		"intercept.question": supported,
		"slashCommands.suggest": unsupported(
			"assist reads skills and commands only from Claude's and Codex's skill dirs, not pi's prompts dir",
			"type the pi prompt name in full in the phone reply bar",
		),
		"session.driven": unsupported(
			"pi runs in a terminal the daemon mirrors rather than a session the daemon drives",
			"pi sessions use the terminal; pick Claude (SDK) for a driven session",
		),
		"tasks.background": unsupported(
			"pi reports no background tasks to assist",
			"pi sessions show no background-task rows",
		),
	},
};
