import Dialog from "@mui/material/Dialog";
import type { ReactNode, RefObject } from "react";

const paperSx = { mt: 6, alignSelf: "flex-start" } as const;

export function TopAnchoredDialog({
	onClose,
	focusRef,
	children,
}: {
	onClose: () => void;
	focusRef: RefObject<HTMLElement | null>;
	children: ReactNode;
}) {
	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			slotProps={{
				paper: { sx: paperSx },
				transition: { onEntered: () => focusRef.current?.focus() },
			}}
		>
			{children}
		</Dialog>
	);
}
