import { CardCloseActions } from "./CardActionButtons/CardCloseActions";
import { SessionActionButtons } from "../../../../SessionActionButtons";
import { StopCardActivation } from "../../../../StopCardActivation";
import type { CardHeaderProps } from "../../../../../types";
import { useTopBarLayoutContext } from "../../../../useTopBarLayoutContext";

export function CardActionButtons({
	session,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
	const topBar = useTopBarLayoutContext();
	return (
		<StopCardActivation>
			{!topBar && (
				<SessionActionButtons
					session={session}
					onRetry={onRetry}
					onRestart={onRestart}
					onDismiss={onDismiss}
				/>
			)}
			<CardCloseActions
				session={session}
				onRestart={onRestart}
				onDismiss={onDismiss}
			/>
		</StopCardActivation>
	);
}
