import type { Session } from "./createSession";

export function autoDismissReason(session: Session): string {
	if (session.reviewStarted) return "backlog run reached review";
	if (session.activity?.kind === "backlog" && session.autoAdvance === false)
		return "backlog run paused with Continue off";
	return `assist ${session.assistArgs?.join(" ") ?? ""} exited cleanly`;
}
