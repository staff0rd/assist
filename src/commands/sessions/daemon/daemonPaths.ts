import { homedir } from "node:os";
import { join } from "node:path";

const DAEMON_DIR = join(homedir(), ".assist", "daemon");

export const daemonPaths = {
	dir: DAEMON_DIR,
	socket:
		process.platform === "win32"
			? "\\\\.\\pipe\\assist-sessions-daemon"
			: join(DAEMON_DIR, "daemon.sock"),
	log: join(DAEMON_DIR, "daemon.log"),
	pid: join(DAEMON_DIR, "daemon.pid"),
};
