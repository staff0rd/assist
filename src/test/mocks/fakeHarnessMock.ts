import type { HarnessAdapter } from "../../shared/harnessAdapters/types";
import {
	supported,
	unsupported,
} from "../../shared/harnessAdapters/unsupported";
import { spawnInherit } from "../../shared/spawnInherit";

export function fakeHarnessMock(): HarnessAdapter {
	return {
		kind: "fake",
		label: "Fake",
		capabilities: {
			"skills.native": supported,
			"conversation.resume": supported,
			"conversation.preassignId": unsupported(
				"the fake harness names its own conversations",
				"none needed; it is a test double",
			),
		},
		detect: () => supported,
		conversation: {
			idName: "fake conversation id",
			findResumable: ({ harnessSessionId }) => harnessSessionId,
		},
		launchSkill: (skill, args, { cwd }) =>
			spawnInherit(
				"fake-harness",
				["run", `@${skill}`, ...(args ? [args] : [])],
				{
					cwd,
				},
			),
		resume: (conversationId, nudge, { cwd }) =>
			spawnInherit("fake-harness", ["continue", conversationId, nudge], {
				cwd,
			}),
		activityIdentity: (_conversationId, resumedId) =>
			resumedId ? { harnessSessionId: resumedId } : {},
	};
}
