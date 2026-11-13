import { CardCloseActions } from "./CardActionButtons/CardCloseActions";
import { StopCardActivation } from "../../../../../StopCardActivation";
import type { CardHeaderProps } from "../../../../../types";

export function CardActionButtons({
	session,
	onRestart,
	onStartOver,
	onDismiss,
	childDismiss,
}: CardHeaderProps) {
	return (
		<StopCardActivation>
			<CardCloseActions
				session={session}
				onRestart={onRestart}
				onStartOver={onStartOver}
				onDismiss={onDismiss}
				childDismiss={childDismiss}
			/>
		</StopCardActivation>
	);
}
