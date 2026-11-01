import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import type { ReactNode } from "react";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { touchTarget } from "../designSystem/touchTarget";

const headerSx = {
	flex: "none",
	display: "grid",
	gridTemplateColumns: "1fr auto 1fr",
	alignItems: "center",
	px: 1.5,
	pt: safeAreaInsets.top,
	borderBottom: 1,
	borderColor: "divider",
} as const;

const closeSx = {
	justifySelf: "start",
	color: "primary.main",
	fontSize: 16,
	minHeight: touchTarget,
	px: 0.5,
	borderRadius: 1,
} as const;

const bodySx = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	flexDirection: "column",
	"& > *": { borderLeft: 0 },
} as const;

export function PhoneReviewSheet({
	open,
	title,
	onClose,
	children,
}: {
	open: boolean;
	title: string;
	onClose: () => void;
	children: ReactNode;
}) {
	return (
		<Dialog
			fullScreen
			open={open}
			onClose={onClose}
			slotProps={{ paper: { sx: { bgcolor: "background.paper" } } }}
		>
			<Box sx={headerSx}>
				<ButtonBase sx={closeSx} onClick={onClose}>
					Close
				</ButtonBase>
				<Box component="h1" sx={{ m: 0, fontSize: 17, fontWeight: 600 }}>
					{title}
				</Box>
			</Box>
			<Box sx={bodySx} data-testid="phone-review-sheet">
				{children}
			</Box>
		</Dialog>
	);
}
