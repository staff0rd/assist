import { daemonLog } from "./daemonLog";
import { reopenHighLevelReviewRun } from "./reopenHighLevelReviewRun";
import { replyOnce } from "./replyOnce";
import type { Handler } from "./routed";

export const handleReopenHighLevelReview: Handler = (client, m, d) => {
	const id = String(d.sessionId);
	const prNumber = Number(d.prNumber);
	const reply = replyOnce(client);
	const session = m.session(id);
	if (!Number.isInteger(prNumber) || prNumber <= 0) {
		daemonLog(`reopen-high-level-review declined: bad PR ${d.prNumber}`);
		return reply({ ok: false, error: `Not a PR number: ${d.prNumber}` });
	}
	if (!session?.pty || session.status === "done" || !session.cwd) {
		daemonLog(
			`reopen-high-level-review #${prNumber} declined: session ${id} is not a live session`,
		);
		return reply({ ok: false, error: "The session is not live." });
	}
	reopenHighLevelReviewRun(m, session, session.cwd, prNumber, reply);
};
