import type { IPty } from "node-pty";
import type { HarnessAdapter } from "../../shared/harnessAdapters/types";
import { supported } from "../../shared/harnessAdapters/unsupported";
import { spawnInherit } from "../../shared/spawnInherit";
import { fakeHarnessCapabilities } from "./fakeHarnessCapabilities";

export type FakeHarnessCalls = {
	interactive: Parameters<HarnessAdapter["interactive"]>[0][];
	oneShot: string[];
};

export function fakeHarnessMock(
	calls: FakeHarnessCalls = { interactive: [], oneShot: [] },
): HarnessAdapter {
	return {
		kind: "fake",
		label: "Fake",
		capabilities: fakeHarnessCapabilities,
		detect: () => supported,
		conversation: {
			idName: "fake conversation id",
			findResumable: ({ harnessSessionId }) => harnessSessionId,
			locate: (id) => Promise.resolve(`/fake/${id}.log`),
		},
		launchSkill: (skill, args, { cwd }) =>
			spawnInherit(
				"fake-harness",
				["run", `@${skill}`, ...(args ? [args] : [])],
				{
					cwd,
				},
			),
		launchPrompt: (prompt, { cwd, allowEdits }) =>
			spawnInherit(
				"fake-harness",
				["ask", ...(allowEdits === false ? ["--read-only"] : []), prompt],
				{ cwd },
			),
		resume: (conversationId, nudge, { cwd }) =>
			spawnInherit("fake-harness", ["continue", conversationId, nudge], {
				cwd,
			}),
		interactive: (launch) => {
			calls.interactive.push(launch);
			return { pid: 4242 } as IPty;
		},
		oneShot: (prompt) => {
			calls.oneShot.push(prompt);
			return Promise.resolve(`fake answer to ${prompt.length} chars\n`);
		},
		activityIdentity: (_conversationId, resumedId) =>
			resumedId ? { harnessSessionId: resumedId } : {},
	};
}
