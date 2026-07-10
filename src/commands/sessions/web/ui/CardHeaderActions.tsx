import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { areChipsLoading } from "./areChipsLoading";
import { CardActionButtons } from "./CardActionButtons";
import { CardChips } from "./CardChips";
<<<<<<< Updated upstream
=======
import { CompleteButton } from "./CompleteButton";
import { DismissButton } from "./DismissButton";
import { OpenPrButton } from "./OpenPrButton";
import { RestartButton } from "./RestartButton";
import { ReviewButton } from "./ReviewButton";
import { RetryButton } from "./RetryButton";
import { reviewTargetPr } from "./reviewTargetPr";
import { SessionStarButton } from "./SessionStarButton";
import { StopCardActivation } from "./StopCardActivation";
>>>>>>> Stashed changes
import type { CardHeaderProps } from "./types";

export function CardHeaderActions({
	session,
	loading,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
<<<<<<< Updated upstream
=======
	const { status } = session;
	const target = backlogTarget(session);
	const pr = usePrStatus(session.cwd, reviewTargetPr(session), status);
>>>>>>> Stashed changes
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			{areChipsLoading(session, loading) ? (
				<CircularProgress size={12} />
			) : (
				<CardChips session={session} />
			)}
			<Box sx={{ flex: 1 }} />
<<<<<<< Updated upstream
			<CardActionButtons
				session={session}
				loading={loading}
				onRetry={onRetry}
				onRestart={onRestart}
				onDismiss={onDismiss}
			/>
=======
			<StopCardActivation>
				{pr && session.cwd && <OpenPrButton pr={pr} />}
				{pr && session.cwd && <ReviewButton cwd={session.cwd} pr={pr} />}
				{onRestart && <RestartButton onRestart={onRestart} />}
				{status === "done" && onRetry && <RetryButton onRetry={onRetry} />}
				<SessionStarButton session={session} />
				{target && (
					<CompleteButton
						target={target}
						cwd={session.cwd}
						onDismiss={onDismiss}
					/>
				)}
				<DismissButton id={session.id} status={status} onDismiss={onDismiss} />
			</StopCardActivation>
>>>>>>> Stashed changes
		</Box>
	);
}
