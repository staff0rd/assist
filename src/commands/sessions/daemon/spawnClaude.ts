import { ensureHooksSettings } from "./ensureHooksSettings";
import { spawnPty } from "./spawnPty";

type SpawnOpts = {
	prompt?: string;
	resumeSessionId?: string;
	cwd?: string;
	sessionId?: string;
	claudeSessionId?: string;
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
	/* why: assign the conversation id up front so the daemon binds the card to the
	 * exact transcript this claude writes, instead of guessing the newest unclaimed
	 * .jsonl in the cwd — which races with concurrent sessions in the same repo and
	 * could adopt another session's conversation (#413). */
	if (opts.claudeSessionId) base.push("--session-id", opts.claudeSessionId);
	if (opts.prompt) return [...base, opts.prompt];
	return base;
}
