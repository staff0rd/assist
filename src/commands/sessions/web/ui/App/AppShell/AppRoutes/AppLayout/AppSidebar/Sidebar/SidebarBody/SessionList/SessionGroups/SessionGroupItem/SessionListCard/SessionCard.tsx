import ButtonBase from "@mui/material/ButtonBase";
import { CardBody } from "./SessionCard/CardBody";
import { CardHeader } from "./SessionCard/CardHeader";
import { displayStatus } from "../../../../../../../../displayStatus";
import { sessionCardSx } from "./SessionCard/sessionCardSx";
import type {
	SessionControlHandlers,
	SessionInfo,
} from "../../../../../../../../../../../types";

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
} & SessionControlHandlers) {
	return (
		<ButtonBase
			onClick={onClick}
			sx={sessionCardSx(active, displayStatus(session))}
			data-session-id={session.id}
		>
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
