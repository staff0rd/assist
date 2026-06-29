import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { daemonPaths } from "./daemonPaths";

const RUNNING = "assist sessions set-status running";
const WAITING = "assist sessions set-status waiting";

function on(command: string, matcher?: string) {
	const hooks = [{ type: "command", command }];
	return [matcher == null ? { hooks } : { matcher, hooks }];
}

const ASK_USER_QUESTION = "AskUserQuestion";
const NOT_ASK_USER_QUESTION = `^(?!${ASK_USER_QUESTION}$).*`;

// why: merged into each daemon-spawned claude via --settings so Claude Code
// pushes real running/waiting state to the daemon instead of the daemon
// guessing from PTY-output idle timing
const hooksSettings = {
	hooks: {
		UserPromptSubmit: on(RUNNING),
		PreToolUse: [
			...on(WAITING, ASK_USER_QUESTION),
			...on(RUNNING, NOT_ASK_USER_QUESTION),
		],
		// tool finished, agent resumes; restores running
		PostToolUse: on(RUNNING),
		Stop: on(WAITING),
		Notification: on(WAITING),
		/* why: a tool/plan approval prompt appears mid-turn, after PreToolUse has
		 * already set running; PermissionRequest fires when the agent blocks on
		 * that decision, so the card shows waiting rather than staying running while
		 * it is genuinely awaiting the user (#449). */
		PermissionRequest: on(WAITING),
	},
};

export function ensureHooksSettings(): string {
	const path = daemonPaths.hooksSettings;
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify(hooksSettings, null, 2));
	return path;
}
