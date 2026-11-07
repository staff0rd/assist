import type { Activity } from "../../../shared/emitActivity";
import { applyActivityToSession } from "./applyActivityToSession";
import { applyCodexLaunch } from "./applyCodexLaunch";
import type { Session } from "./createSession";

export function applyLaunchActivity(
	session: Session,
	activity: Activity,
	notify: () => void,
): void {
	const codexLaunch =
		activity.harness === "codex" &&
		activity.startedAt !== session.activity?.startedAt;
	applyActivityToSession(session, activity);
	if (codexLaunch) applyCodexLaunch(session, activity, notify);
}
