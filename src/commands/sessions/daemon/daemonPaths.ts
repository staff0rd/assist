import { homedir } from "node:os";
import { basename, join } from "node:path";
import { daemonDir } from "./daemonDir";

const DAEMON_DIR = daemonDir();

function perUserWindowsPipe(): string {
	const suffix = process.env.ASSIST_DAEMON_DIR
		? DAEMON_DIR
		: basename(homedir());
	return String.raw`\\.\pipe\assist-sessions-daemon-${suffix.replace(/[^\w.-]/g, "_")}`;
}

export const daemonPaths = {
	dir: DAEMON_DIR,
	socket:
		process.platform === "win32"
			? perUserWindowsPipe()
			: join(DAEMON_DIR, "daemon.sock"),
	log: join(DAEMON_DIR, "daemon.log"),
	pid: join(DAEMON_DIR, "daemon.pid"),
	runtime: join(DAEMON_DIR, "runtime.json"),
	autoUpdatePaused: join(DAEMON_DIR, "auto-update-paused"),
	spawnLock: join(DAEMON_DIR, "spawn.lock"),
	hooksSettings: join(DAEMON_DIR, "hooks-settings.json"),
	viewerSize: join(DAEMON_DIR, "viewer-size.json"),
	promptJournal: join(DAEMON_DIR, "prompt-journal.jsonl"),
	transcriptEchoes: join(DAEMON_DIR, "transcript-echoes"),
	autopilot: join(DAEMON_DIR, "autopilot.json"),
};
