import Dialog from "@mui/material/Dialog";
import type { ReactNode } from "react";

const topAnchoredSx = { mt: 6, alignSelf: "flex-start" } as const;

export function AutoFocusDialog({
	onClose,
	onEntered,
	centered = false,
	children,
}: {
	onClose: () => void;
	onEntered: () => void;
	centered?: boolean;
	children: ReactNode;
}) {
	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			slotProps={{
				paper: { sx: centered ? undefined : topAnchoredSx },
				transition: { onEntered },
			}}
		>
			{children}
		</Dialog>
	);
}
