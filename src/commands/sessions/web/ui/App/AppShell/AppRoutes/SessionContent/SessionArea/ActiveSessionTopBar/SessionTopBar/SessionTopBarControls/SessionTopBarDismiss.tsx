import Box from "@mui/material/Box";
import { DismissButton } from "../../../../../DismissButton";
import type { SessionInfo } from "../../../../../../../../types";

const dismissSx = { display: "flex", flexShrink: 0 } as const;

export function SessionTopBarDismiss({
	session,
	onDismiss,
}: {
	session: SessionInfo;
	onDismiss: () => void;
}) {
	const { status, id } = session;
	if (status === "stopped" || session.closing) return null;
	return (
		<Box sx={dismissSx}>
			<DismissButton id={id} status={status} onDismiss={onDismiss} />
		</Box>
	);
}
