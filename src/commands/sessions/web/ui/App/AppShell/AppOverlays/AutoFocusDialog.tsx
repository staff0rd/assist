import Dialog, { type DialogProps } from "@mui/material/Dialog";
import type { ReactNode } from "react";

const topAnchoredSx = { mt: 6, alignSelf: "flex-start" } as const;

export function AutoFocusDialog({
	onClose,
	onEntered,
	centered = false,
	maxWidth = "sm",
	children,
}: {
	onClose: () => void;
	onEntered: () => void;
	centered?: boolean;
	maxWidth?: DialogProps["maxWidth"];
	children: ReactNode;
}) {
	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth={maxWidth}
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
