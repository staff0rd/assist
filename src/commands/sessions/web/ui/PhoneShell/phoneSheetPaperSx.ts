import { safeAreaInsets } from "../designSystem/safeAreaInsets";

export const phoneSheetPaperSx = {
	borderRadius: "14px 14px 0 0",
	maxHeight: "calc(100% - 64px)",
	overflowY: "auto",
	pt: 1,
	pb: `calc(${safeAreaInsets.bottom} + 16px)`,
	bgcolor: "background.paper",
} as const;
