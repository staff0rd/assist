import type { Activity } from "../../../shared/emitActivity";
import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { applyActivityToSession } from "./applyActivityToSession";
import { applyLateBoundLaunch } from "./applyLateBoundLaunch";
import type { Session } from "./createSession";

export function applyLaunchActivity(
	session: Session,
	activity: Activity,
	notify: () => void,
	onBound?: (session: Session) => void,
): void {
	const lateBoundLaunch =
		!!activity.harness &&
		!!harnessAdapter(activity.harness).conversation.discover &&
		activity.startedAt !== session.activity?.startedAt;
	applyActivityToSession(session, activity);
	if (lateBoundLaunch) applyLateBoundLaunch(session, activity, notify, onBound);
}
