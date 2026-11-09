import type { IPty } from "node-pty";
import type { HarnessAdapter } from "../../shared/harnessAdapters/types";
import { supported } from "../../shared/harnessAdapters/unsupported";
import { spawnInherit } from "../../shared/spawnInherit";
import { type FakeConnectorScript, fakeConnectorRun } from "./fakeConnectorRun";
import { fakeHarnessConversation } from "./fakeHarnessConversation";
import { fakeHarnessCapabilities } from "./fakeHarnessCapabilities";
import { type FakeHarnessCalls, fakeHarnessCalls } from "./fakeHarnessCalls";
import { fakeStructuredRun } from "./fakeStructuredRun";
import { fakeToolOperations } from "./fakeToolOperations";

export function fakeHarnessMock(
	calls: FakeHarnessCalls = fakeHarnessCalls(),
	connectorScript?: FakeConnectorScript,
): HarnessAdapter {
	return {
		kind: "fake",
		label: "Fake",
		capabilities: fakeHarnessCapabilities,
		detect: () => supported,
		conversation: fakeHarnessConversation,
		toolOperations: fakeToolOperations,
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
		structured: fakeStructuredRun(calls.structured),
		connectorRun: fakeConnectorRun(calls.connector, connectorScript),
		activityIdentity: (_conversationId, resumedId) =>
			resumedId ? { harnessSessionId: resumedId } : {},
	};
}
