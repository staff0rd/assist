import { backlogTarget } from "./backlogTarget";
import { CompleteButton } from "./CompleteButton";
import { DismissButton } from "./DismissButton";
import { OpenInCodeButton } from "./OpenInCodeButton";
import { OpenPrButton } from "./OpenPrButton";
import { RestartButton } from "./RestartButton";
import { ReviewButton } from "./ReviewButton";
import { RetryButton } from "./RetryButton";
import { reviewTargetPr } from "./reviewTargetPr";
import { SessionStarButton } from "./SessionStarButton";
import { StopCardActivation } from "./StopCardActivation";
import type { CardHeaderProps } from "./types";
import { usePrStatus } from "./usePrStatus";

export function CardActionButtons({
	session,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
	const { status } = session;
	const target = backlogTarget(session);
	const pr = usePrStatus(session.cwd, reviewTargetPr(session), status);
	return (
		<StopCardActivation>
			{session.cwd && <OpenInCodeButton cwd={session.cwd} variant="card" />}
			{pr && session.cwd && <OpenPrButton pr={pr} />}
			{pr && session.cwd && <ReviewButton cwd={session.cwd} pr={pr} />}
			{onRestart && (
				<RestartButton onRestart={onRestart} harness={session.harness} />
			)}
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
	);
}
