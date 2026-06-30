import Box from "@mui/material/Box";
import { backlogTarget } from "./backlogTarget";
import { CardChips } from "./CardChips";
import { CompleteButton } from "./CompleteButton";
import { DismissButton } from "./DismissButton";
import { OpenPrButton } from "./OpenPrButton";
import { ReviewButton } from "./ReviewButton";
import { RetryButton } from "./RetryButton";
import { SessionStarButton } from "./SessionStarButton";
import { sessionStarTarget } from "./sessionStarTarget";
import type { SessionInfo } from "./types";
import { usePrStatus } from "./usePrStatus";

export function CardHeaderActions({
	session,
	onRetry,
	onDismiss,
}: {
	session: SessionInfo;
	onRetry?: () => void;
	onDismiss: () => void;
}) {
	const { status } = session;
	const target = backlogTarget(session);
	const canStar = sessionStarTarget(session) !== undefined;
	const pr = usePrStatus(session.cwd);
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			<CardChips session={session} />
			<Box sx={{ flex: 1 }} />
			{pr && session.cwd && <OpenPrButton pr={pr} />}
			{pr && session.cwd && <ReviewButton cwd={session.cwd} pr={pr} />}
			{status === "done" && onRetry && <RetryButton onRetry={onRetry} />}
			{canStar && <SessionStarButton session={session} />}
			{target && (
				<CompleteButton
					target={target}
					cwd={session.cwd}
					onDismiss={onDismiss}
				/>
			)}
			<DismissButton id={session.id} status={status} onDismiss={onDismiss} />
		</Box>
	);
}
