import type { HarnessKind } from "../../../../shared/harnesses";
import { harnessCapability } from "../../../../shared/harnessAdapters/harnessCapability";
import { createSdkRelay } from "./createSdkRelay";
import { publishWorkflowOutput } from "./publishWorkflowOutput";

export function createWorkflowRelay(
	harness: HarnessKind,
	label: string,
	command: string,
) {
	const relay = createSdkRelay(
		label,
		harnessCapability(harness, "tasks.background").supported,
		() => output.end(),
	);
	const output = publishWorkflowOutput(command, relay.emit);
	return { relay, output };
}
