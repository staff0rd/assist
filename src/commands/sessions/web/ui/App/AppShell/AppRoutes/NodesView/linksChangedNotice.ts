import type { DaemonReload } from "./postNodesApi";

export function linksChangedNotice(done: string, daemon: DaemonReload): string {
	if (daemon.kind === "reloaded") return done;
	if (daemon.kind === "not-running")
		return `${done}. The daemon picks the change up when it starts.`;
	return `${done}, but the daemon did not reload its links (${daemon.message}); restart the daemon to apply it.`;
}
