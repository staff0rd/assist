import { safeAreaInsets } from "../../../../designSystem/safeAreaInsets";
import { statusBarInset } from "../../../../designSystem/statusBarInset";

export const appLayoutSx = {
	display: "flex",
	width: "100%",
	height: `calc(100vh - 48px - ${safeAreaInsets.top} - ${statusBarInset})`,
} as const;
