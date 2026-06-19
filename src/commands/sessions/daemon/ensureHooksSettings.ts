import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { daemonPaths } from "./daemonPaths";

const RUNNING = "assist sessions set-status running";
const WAITING = "assist sessions set-status waiting";

function on(command: string) {
	return [{ hooks: [{ type: "command", command }] }];
}

// why: merged into each daemon-spawned claude via --settings so Claude Code
// pushes real running/waiting state to the daemon instead of the daemon
// guessing from PTY-output idle timing
const hooksSettings = {
	hooks: {
		UserPromptSubmit: on(RUNNING),
		PreToolUse: on(RUNNING),
		Stop: on(WAITING),
		Notification: on(WAITING),
	},
};

export function ensureHooksSettings(): string {
	const path = daemonPaths.hooksSettings;
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify(hooksSettings, null, 2));
	return path;
}
