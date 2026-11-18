import { sessionTextSize } from "../../../../sessions/web/ui/App/sessionTextSize";

export function slatePhaseRowSx(active: boolean) {
	return {
		justifyContent: "flex-start",
		alignItems: "flex-start",
		gap: 1,
		minWidth: 0,
		py: "3px",
		pl: 0.5,
		fontSize: sessionTextSize(12),
		textAlign: "left",
		color: active ? "text.primary" : "text.secondary",
		transition: "color .2s ease",
		"&:hover": { color: "text.primary" },
		"& .phase-label": {
			minWidth: 0,
			lineHeight: "18px",
			overflowWrap: "anywhere",
		},
		"& .phase-caption": {
			display: "block",
			fontSize: sessionTextSize(11),
			lineHeight: "16px",
			color: "text.secondary",
		},
	} as const;
}
