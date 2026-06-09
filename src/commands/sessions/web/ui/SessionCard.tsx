import ButtonBase from "@mui/material/ButtonBase";
import { AutoRunToggle } from "./AutoRunToggle";
import { CardHeader, cardSx } from "./CardHeader";
import { StatusRow } from "./StatusRow";
import { sessionType } from "./sessionType";
import type { SessionInfo } from "./types";
import { useElapsed } from "./useElapsed";

export function SessionCard({
	session,
	active,
	onClick,
	onRetry,
	onDismiss,
	onSetAutoRun,
}: {
	session: SessionInfo;
	active: boolean;
	onClick: () => void;
	onRetry?: () => void;
	onDismiss: () => void;
	onSetAutoRun: (enabled: boolean) => void;
}) {
	const elapsed = useElapsed(session.startedAt, session.status);
	const type = sessionType(session);
	const showAutoRun = type === "draft" || type === "bug";

	return (
		<ButtonBase onClick={onClick} sx={cardSx(active)}>
			<CardHeader session={session} onRetry={onRetry} onDismiss={onDismiss} />
			<StatusRow
				status={session.status}
				elapsed={elapsed}
				restored={session.restored}
			/>
			{showAutoRun && (
				<AutoRunToggle
					checked={session.autoRun ?? false}
					onChange={onSetAutoRun}
				/>
			)}
		</ButtonBase>
	);
}
