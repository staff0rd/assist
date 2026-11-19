import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";
import type { SdkShellChunk } from "../../shared/SdkShellRow";
import { throttleNotify } from "../shell/throttleNotify";
import { createWorkflowOutputBuffer } from "./createWorkflowOutputBuffer";

/* why: the first publish is throttled too, so it lands after wirePtyEvents
 * subscribes to the relay that spawnSdkWorkflow has only just returned. */
export function publishWorkflowOutput(
	command: string,
	emit: (event: SdkSessionEvent) => void,
) {
	const buffer = createWorkflowOutputBuffer();
	const startedAt = Date.now();
	const update = throttleNotify(() =>
		emit({
			kind: "workflow",
			workflow: { command, startedAt, lines: buffer.lines() },
		}),
	);
	update();
	let ended = false;
	return {
		append: (stream: SdkShellChunk["stream"], data: string) => {
			if (ended) return;
			buffer.append(stream, data);
			update();
		},
		end: () => {
			if (ended) return;
			ended = true;
			update.cancel();
			emit({ kind: "workflow", workflow: null });
		},
	};
}
