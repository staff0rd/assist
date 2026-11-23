import { daemonLog } from "../daemonLog";
import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotStore } from "./createAutopilotStore";
import { summaryPrompt } from "./summaryPrompt";

/** Prompt an idle run that recorded no summary; true while it is held open for one. */
export function requestRunSummary(
	store: AutopilotStore,
	deps: AutopilotDeps,
	cwd: string,
): boolean {
	const current = store.repo(cwd).current;
	if (!current || current.summary || current.summaryRequestedAt) return false;
	const sent = deps.promptSession(current.sessionId, summaryPrompt());
	daemonLog(
		`autopilot: ${cwd} run ${current.sessionId} ${sent ? "prompted for its summary" : "could not be prompted for its summary"}`,
	);
	if (!sent) return false;
	store.update(cwd, (repo) => {
		if (repo.current)
			repo.current.summaryRequestedAt = new Date().toISOString();
	});
	return true;
}
