import Dialog from "@mui/material/Dialog";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

const topAnchoredSx = { mt: 6, alignSelf: "flex-start" } as const;

export function AutoFocusDialog({
	onClose,
	onEntered,
	centered = false,
	paperMaxWidth,
	children,
}: {
	onClose: () => void;
	onEntered: () => void;
	centered?: boolean;
	paperMaxWidth?: (t: Theme) => number;
	children: ReactNode;
}) {
	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth={paperMaxWidth ? false : "sm"}
			fullWidth
			slotProps={{
				paper: {
					sx: [
						centered ? {} : topAnchoredSx,
						paperMaxWidth ? (t: Theme) => ({ maxWidth: paperMaxWidth(t) }) : {},
					],
				},
				transition: { onEntered },
			}}
		>
			{children}
		</Dialog>
	);
}
