import type {
	ConnectorRun,
	ConnectorRunEvent,
	ConnectorRunResult,
	ConnectorTool,
} from "../../shared/harnessAdapters/types";

type FakeConnectorStep =
	| ConnectorRunEvent
	| { type: "call"; tool: ConnectorTool | "fake.sendMessage"; input?: object };

export type FakeConnectorScript = (run: ConnectorRun) => {
	steps?: FakeConnectorStep[];
	output?: unknown;
	fail?: string;
};

const ZERO = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0,
	costUsd: null,
	durationMs: null,
};

function refusedTool(
	run: ConnectorRun,
	step: FakeConnectorStep,
): string | undefined {
	if (step.type !== "call") return undefined;
	return run.tools.includes(step.tool as ConnectorTool) ? undefined : step.tool;
}

export function fakeConnectorRun(
	calls: ConnectorRun[],
	script: FakeConnectorScript = () => ({ output: { messages: [] } }),
): (run: ConnectorRun) => Promise<ConnectorRunResult> {
	return async (run) => {
		calls.push(run);
		const { steps = [], output, fail } = script(run);
		let callId = 0;
		for (const step of steps) {
			const refused = refusedTool(run, step);
			if (refused)
				throw new Error(`fake harness refused ${refused}: not allowed`);
			if (step.type === "call")
				run.onEvent({
					type: "toolCall",
					callId: `c${callId++}`,
					tool: step.tool as ConnectorTool,
					label: `Fake ${step.tool}`,
					input: { ...step.input },
				});
			else run.onEvent(step);
		}
		if (fail) throw new Error(fail);
		return { output, usage: ZERO };
	};
}
