import { ensureHooksSettings } from "./ensureHooksSettings";
import { spawnPty } from "./spawnPty";

type SpawnOpts = {
	prompt?: string;
	resumeSessionId?: string;
	cwd?: string;
	sessionId?: string;
};

export function spawnClaude(opts: SpawnOpts = {}) {
	return spawnPty(buildArgs(opts), opts.cwd, opts.sessionId);
}

function buildArgs(opts: SpawnOpts): string[] {
	const base = ["claude", "--settings", ensureHooksSettings()];
	/* why: resuming replays the existing transcript, so the original prompt is
	 * already in context; an optional `prompt` here is a short nudge that drives
	 * the interrupted turn to completion (consistent with backlog runs, #404). */
	if (opts.resumeSessionId) {
		return opts.prompt
			? [...base, "--resume", opts.resumeSessionId, opts.prompt]
			: [...base, "--resume", opts.resumeSessionId];
	}
	if (opts.prompt) return [...base, opts.prompt];
	return base;
}
