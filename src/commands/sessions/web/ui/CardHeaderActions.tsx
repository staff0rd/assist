import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { areChipsLoading } from "./areChipsLoading";
import { backlogTarget } from "./backlogTarget";
import { CardChips } from "./CardChips";
import { CompleteButton } from "./CompleteButton";
import { DismissButton } from "./DismissButton";
import { OpenPrButton } from "./OpenPrButton";
import { RestartButton } from "./RestartButton";
import { ReviewButton } from "./ReviewButton";
import { RetryButton } from "./RetryButton";
import { reviewTargetPr } from "./reviewTargetPr";
import { SessionStarButton } from "./SessionStarButton";
import { sessionStarTarget } from "./sessionStarTarget";
import type { CardHeaderProps } from "./types";
import { usePrStatus } from "./usePrStatus";

export function CardHeaderActions({
	session,
	loading,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
	const { status } = session;
	const target = backlogTarget(session);
	const canStar = sessionStarTarget(session) !== undefined;
	const pr = usePrStatus(session.cwd, reviewTargetPr(session));
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			{areChipsLoading(session, loading) ? (
				<CircularProgress size={12} />
			) : (
				<CardChips session={session} />
			)}
			<Box sx={{ flex: 1 }} />
			{pr && session.cwd && <OpenPrButton pr={pr} />}
			{pr && session.cwd && <ReviewButton cwd={session.cwd} pr={pr} />}
			{onRestart && <RestartButton onRestart={onRestart} />}
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
