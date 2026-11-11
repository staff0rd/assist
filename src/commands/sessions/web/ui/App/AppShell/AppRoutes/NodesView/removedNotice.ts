import type { DaemonReload } from "./requestNodeUnlink";

export function removedNotice(name: string, daemon: DaemonReload): string {
	if (daemon.kind === "reloaded") return `Removed ${name}`;
	if (daemon.kind === "not-running")
		return `Removed ${name}. The daemon picks the change up when it starts.`;
	return `Removed ${name}, but the daemon did not reload its links (${daemon.message}); restart the daemon to apply it.`;
}
