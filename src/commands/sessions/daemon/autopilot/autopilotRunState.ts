import type { Session } from "../types";
import {
	type AutopilotSessionState,
	autopilotSessionState,
} from "./autopilotSessionState";

export function autopilotRunState(
	root: Session | undefined,
	run: Session[],
): AutopilotSessionState {
	if (run.some((session) => autopilotSessionState(session) === "live"))
		return "live";
	return autopilotSessionState(root);
}
