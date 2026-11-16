import { harnessAgentName } from "../../../../../../../../shared/harnessAdapters/harnessLabel";
import type { SessionInfo } from "../../../../types";

const ENDED = new Set(["done", "stopped", "error", "parked"]);

function placeholder(
	agent: string,
	live: boolean,
	resuming: boolean,
	running: boolean,
) {
	if (!live) return "This session has ended";
	if (resuming) return "Resuming conversation…";
	if (running) return `Message ${agent}… (queues until this turn ends)`;
	return `Message ${agent}…`;
}

export function sdkComposerState(session: SessionInfo) {
	const running = session.status === "running";
	const live = !ENDED.has(session.status);
	const resuming = live && Boolean(session.sdkResuming);
	const agent = harnessAgentName(session.harness);
	const waiting = session.status === "waiting" && !resuming;
	return {
		running,
		live,
		resuming,
		enabled: live && !resuming,
		stopping: running && Boolean(session.sdkInterrupting),
		agent,
		placeholder: placeholder(agent, live, resuming, running),
		suggestion: waiting ? session.sdkPromptSuggestion : undefined,
	};
}
