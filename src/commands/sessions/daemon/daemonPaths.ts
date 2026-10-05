import { homedir } from "node:os";
import { basename, join } from "node:path";

const DAEMON_DIR = join(homedir(), ".assist", "daemon");

function perUserWindowsPipe(): string {
	const user = basename(homedir()).replace(/[^\w.-]/g, "_");
	return String.raw`\\.\pipe\assist-sessions-daemon-${user}`;
}

export const daemonPaths = {
	dir: DAEMON_DIR,
	socket:
		process.platform === "win32"
			? perUserWindowsPipe()
			: join(DAEMON_DIR, "daemon.sock"),
	log: join(DAEMON_DIR, "daemon.log"),
	pid: join(DAEMON_DIR, "daemon.pid"),
	spawnLock: join(DAEMON_DIR, "spawn.lock"),
	hooksSettings: join(DAEMON_DIR, "hooks-settings.json"),
};
