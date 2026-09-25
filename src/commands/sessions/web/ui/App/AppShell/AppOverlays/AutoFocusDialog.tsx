import Dialog from "@mui/material/Dialog";
import type { ReactNode, RefObject } from "react";

const topAnchoredSx = { mt: 6, alignSelf: "flex-start" } as const;

export function AutoFocusDialog({
	onClose,
	focusRef,
	centered = false,
	children,
}: {
	onClose: () => void;
	focusRef: RefObject<HTMLElement | null>;
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
				transition: { onEntered: () => focusRef.current?.focus() },
			}}
		>
			{children}
		</Dialog>
	);
}
