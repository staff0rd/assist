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
	return (
		<>
			{(type === "draft" || type === "bug" || type === "refine") && (
				<AutoRunToggle
					checked={session.autoRun ?? false}
					onChange={onSetAutoRun}
				/>
			)}
			{session.activity?.kind === "backlog" && (
				<AutoAdvanceToggle
					checked={session.autoAdvance ?? true}
					onChange={onSetAutoAdvance}
				/>
			)}
		</>
	);
}
