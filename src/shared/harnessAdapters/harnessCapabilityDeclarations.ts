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
	},
	codex: {
		"skills.native": supported,
		"conversation.resume": supported,
		"conversation.preassignId": unsupported(
			"Codex assigns its own conversation id when its rollout starts",
			"assist binds the Codex conversation id from the rollout after launch",
		),
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
	},
};
