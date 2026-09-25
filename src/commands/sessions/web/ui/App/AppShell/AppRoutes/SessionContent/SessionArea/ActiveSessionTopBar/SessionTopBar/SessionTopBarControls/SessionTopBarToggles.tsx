import { CardToggle } from "../../../../../CardToggle";
import { sessionToggles } from "../../../../../sessionToggles";
import type { SessionInfo } from "../../../../../../../../types";

export function SessionTopBarToggles({
	session,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	onSetAutoRun: (enabled: boolean) => void;
	onSetAutoAdvance: (enabled: boolean) => void;
}) {
	return (
		<>
			{sessionToggles(session).map((toggle) => (
				<CardToggle
					key={toggle.key}
					inline
					label={toggle.label}
					checked={toggle.checked}
					onChange={toggle.key === "autoRun" ? onSetAutoRun : onSetAutoAdvance}
				/>
			))}
		</>
	);
}
