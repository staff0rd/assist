import { homedir } from "node:os";
import { join } from "node:path";

export function daemonDir(): string {
	return process.env.ASSIST_DAEMON_DIR || join(homedir(), ".assist", "daemon");
}
