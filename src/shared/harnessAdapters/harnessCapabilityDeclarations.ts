import type { HarnessKind } from "../harnesses";
import type { CapabilityDeclarations } from "./types";
import { supported, unsupported } from "./unsupported";

export const harnessCapabilityDeclarations: Record<
	HarnessKind,
	CapabilityDeclarations
> = {
	claude: {
		"skills.native": supported,
		"conversation.resume": supported,
		"conversation.relocate": supported,
		"conversation.preassignId": supported,
		"systemPrompt.append": supported,
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
		"intercept.question": supported,
	},
	codex: {
		"skills.native": supported,
		"conversation.resume": supported,
		"conversation.relocate": supported,
		"conversation.preassignId": unsupported(
			"Codex assigns its own conversation id when its rollout starts",
			"assist binds the Codex conversation id from the rollout after launch",
		),
		"systemPrompt.append": supported,
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
		"intercept.question": unsupported(
			"Codex hooks are not verified to report its native request_user_input question tool",
			"the composed advice tells Codex to ask with assist ask-question; a native Codex question is answered in the terminal",
			"a1563",
		),
	},
	pi: {
		"skills.native": supported,
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
		"conversation.preassignId": unsupported(
			"pi does not accept a caller-assigned conversation id",
			"the session card tracks pi without a conversation id",
		),
		"systemPrompt.append": unsupported(
			"assist has not verified a pi flag that appends a system prompt at launch and on resume",
			"start design sessions with Claude or Codex, or run /design inside a pi session to read the design prompt from disk",
			"a696",
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
		"intercept.question": supported,
	},
};
