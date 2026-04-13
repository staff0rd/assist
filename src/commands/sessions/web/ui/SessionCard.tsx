import type { MouseEvent } from "react";
import { CardHeader, cardStyle, StatusRow } from "./cardStyle";
import type { SessionInfo } from "./types";
import { useElapsed } from "./useElapsed";

export function SessionCard({
	session,
	active,
	onClick,
	onDismiss,
}: {
	session: SessionInfo;
	active: boolean;
	onClick: () => void;
	onDismiss: () => void;
}) {
	const elapsed = useElapsed(session.startedAt);
	const handleHover = (e: MouseEvent<HTMLButtonElement>, enter: boolean) => {
		if (!active) e.currentTarget.style.background = enter ? "#333" : "#2d2d2d";
	};

	return (
		<button
			type="button"
			onClick={onClick}
			style={cardStyle(active)}
			onMouseEnter={(e) => handleHover(e, true)}
			onMouseLeave={(e) => handleHover(e, false)}
		>
			<CardHeader
				name={session.name}
				isDone={session.status === "done"}
				onDismiss={onDismiss}
			/>
			<StatusRow status={session.status} elapsed={elapsed} />
		</button>
	);
}
