import Box from "@mui/material/Box";
import { DismissButton } from "../../../../../../DismissButton";
import type { ChildDismiss, SessionInfo } from "../../../../../../../types";

const dismissSx = { display: "flex", flexShrink: 0 } as const;

export function SessionTopBarDismiss({
	session,
	onDismiss,
	childDismiss,
}: {
	session: SessionInfo;
	onDismiss: () => void;
	childDismiss?: ChildDismiss;
}) {
	const { status, id } = session;
	if (status === "stopped" || session.closing) return null;
	return (
		<Box sx={dismissSx}>
			<DismissButton
				id={id}
				status={status}
				onDismiss={onDismiss}
				childDismiss={childDismiss}
			/>
		</Box>
	);
}
