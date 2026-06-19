import { AutoAdvanceToggle } from "./AutoAdvanceToggle";
import { AutoRunToggle } from "./AutoRunToggle";
import { sessionType } from "./sessionType";
import type { SessionInfo } from "./types";

export function CardToggles({
	session,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	onSetAutoRun: (enabled: boolean) => void;
	onSetAutoAdvance: (enabled: boolean) => void;
}) {
	const type = sessionType(session);
	const activity = session.activity;
	const inReviewPhase =
		activity?.kind === "backlog" &&
		activity.phase !== undefined &&
		activity.phase === activity.totalPhases;
	return (
		<>
			{(type === "draft" || type === "bug" || type === "refine") && (
				<AutoRunToggle
					checked={session.autoRun ?? false}
					onChange={onSetAutoRun}
				/>
			)}
			{activity?.kind === "backlog" && (
				<AutoAdvanceToggle
					label={inReviewPhase ? "Dismiss" : "Continue"}
					checked={session.autoAdvance ?? true}
					onChange={onSetAutoAdvance}
				/>
			)}
		</>
	);
}
