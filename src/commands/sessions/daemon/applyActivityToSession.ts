import type { Activity } from "../../../shared/emitActivity";
import type { Session } from "./createSession";
import { noteWorktreeHarness } from "./worktree/noteWorktreeHarness";

export function applyActivityToSession(
	session: Session,
	activity: Activity,
): void {
	session.activity = activity;
	if (activity.harness && activity.harness !== session.harness) {
		session.harness = activity.harness;
		noteWorktreeHarness(session);
	}
	if (activity.claudeSessionId)
		session.claudeSessionId = activity.claudeSessionId;
}
