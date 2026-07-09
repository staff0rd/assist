import ButtonBase from "@mui/material/ButtonBase";
import { CardBody } from "./CardBody";
import { CardHeader } from "./CardHeader";
import { cardSx } from "./cardSx";
import type { SessionInfo } from "./types";

export function SessionCard({
	session,
	active,
	loading,
	onClick,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	active: boolean;
	loading: boolean;
	onClick: () => void;
	onRetry?: () => void;
	onRestart?: () => void;
	onDismiss: () => void;
	onSetAutoRun: (enabled: boolean) => void;
	onSetAutoAdvance: (enabled: boolean) => void;
}) {
	return (
		<ButtonBase onClick={onClick} sx={cardSx(active)}>
			<CardHeader
				session={session}
				loading={loading}
				onRetry={onRetry}
				onRestart={onRestart}
				onDismiss={onDismiss}
			/>
			<CardBody
				session={session}
				loading={loading}
				onSetAutoRun={onSetAutoRun}
				onSetAutoAdvance={onSetAutoAdvance}
			/>
		</ButtonBase>
	);
}
