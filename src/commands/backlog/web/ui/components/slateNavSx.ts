import { statusBarInset } from "../../../../sessions/web/ui/designSystem/statusBarInset";
import { itemDetailLayout } from "./itemDetailLayout";
import { sessionTextSize } from "../../../../sessions/web/ui/App/sessionTextSize";

const APP_BAR_HEIGHT = 48;

export const slateNavSx = {
	display: "none",
	[itemDetailLayout.wideQuery]: { display: "grid" },
	alignContent: "start",
	gap: "2px",
	position: "sticky",
	top: 0,
	alignSelf: "flex-start",
	width: 200,
	flexShrink: 0,
	maxHeight: `calc(100vh - ${APP_BAR_HEIGHT}px - ${statusBarInset})`,
	overflowY: "auto",
	overflowX: "hidden",
	pt: "44px",
	pb: 2,
} as const;

export function slateLinkSx(active: boolean) {
	return {
		justifyContent: "flex-start",
		px: "10px",
		py: 0.5,
		borderLeft: 2,
		borderColor: active ? "primary.main" : "divider",
		fontSize: sessionTextSize(13),
		textAlign: "left",
		color: active ? "text.primary" : "text.secondary",
		transition: "color .2s ease",
		"&:hover": { color: "text.primary" },
	} as const;
}

export const slatePhasesSx = {
	display: "grid",
	gap: "2px",
	pl: "10px",
	borderLeft: 2,
	borderColor: "divider",
} as const;
