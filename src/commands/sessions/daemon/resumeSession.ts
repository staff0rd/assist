import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../../shared/harnesses";
import type { Session } from "./createSession";
import { startOrHoldPty } from "./startOrHoldPty";

export function resumeSession(
	id: string,
	sessionId: string,
	cwd: string,
	name?: string,
	holdPty?: boolean,
	harness?: HarnessKind,
): Session {
	const startedAt = Date.now();
	const adapter = harnessAdapter(harness);
	return {
		id,
		name: name ? `${name.slice(0, 36)} (R)` : `Resume ${sessionId.slice(0, 8)}`,
		commandType: "claude",
		harness,
		status: "waiting",
		startedAt,
		runningMs: 0,
		runningSince: null,
		waitingSince: startedAt,
		...startOrHoldPty(
			() => adapter.interactive({ resumeId: sessionId, cwd, sessionId: id }),
			holdPty,
		),
		scrollback: "",
		/* why: bind the card to the conversation it is resuming so a daemon restart
		 * re-resumes this same transcript, not whichever .jsonl a cwd poller would
		 * have re-discovered (#413). */
		...adapter.conversation.toRef(sessionId),
		cwd,
	};
}
