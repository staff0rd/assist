import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { canonicalTreePath } from "./canonicalTreePath";

export function watcherLogPath(cwd: string): string {
	const clone = canonicalTreePath(cwd);
	const key = createHash("sha1").update(clone).digest("hex").slice(0, 8);
	const dir =
		process.env.ASSIST_WATCHER_LOG_DIR ??
		join(homedir(), ".assist", "watchers");
	return join(dir, `${basename(clone) || "root"}-${key}.log`);
}
