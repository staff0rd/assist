import ButtonBase from "@mui/material/ButtonBase";
import { CardHeader, cardSx, StatusRow } from "./CardHeader";
import type { SessionInfo } from "./types";
import { useElapsed } from "./useElapsed";

export function SessionCard({
	session,
	active,
	onClick,
	onRetry,
	onDismiss,
}: {
	session: SessionInfo;
	active: boolean;
	onClick: () => void;
	onRetry?: () => void;
	onDismiss: () => void;
}) {
	const elapsed = useElapsed(session.startedAt);

	return (
		<ButtonBase onClick={onClick} sx={cardSx(active)}>
			<CardHeader
				name={session.name}
				isDone={session.status === "done"}
				onRetry={onRetry}
				onDismiss={onDismiss}
			/>
			<StatusRow status={session.status} elapsed={elapsed} />
		</ButtonBase>
	);
}
