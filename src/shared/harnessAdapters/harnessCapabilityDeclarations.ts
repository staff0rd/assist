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
		"conversation.preassignId": supported,
		"oneShot.text": supported,
		"oneShot.structured": supported,
		"usage.rateLimits": supported,
	},
	codex: {
		"skills.native": supported,
		"conversation.resume": supported,
		"conversation.preassignId": unsupported(
			"Codex assigns its own conversation id when its rollout starts",
			"assist binds the Codex conversation id from the rollout after launch",
		),
		"oneShot.text": supported,
		"oneShot.structured": supported,
		"usage.rateLimits": supported,
	},
	pi: {
		"skills.native": supported,
		"conversation.resume": unsupported(
			"pi sessions cannot be resumed yet",
			"restart starts a fresh pi conversation; pick Claude or Codex to keep the conversation across restarts",
			"a696",
		),
		"conversation.preassignId": unsupported(
			"pi does not accept a caller-assigned conversation id",
			"the session card tracks pi without a conversation id",
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
	},
};
