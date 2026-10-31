import type { Theme } from "@mui/material/styles";
import { safeAreaInsets } from "../../designSystem/safeAreaInsets";

function badge(t: Theme) {
	const size = t.tokens.density.tabBar.badge;
	return {
		position: "absolute",
		top: -size / 3,
		left: "60%",
		minWidth: size,
		height: size,
		px: 0.5,
		borderRadius: `${size / 2}px`,
		bgcolor: "error.main",
		color: "error.contrastText",
		fontSize: t.tokens.density.tabBar.label,
		fontWeight: 600,
		lineHeight: `${size}px`,
		textAlign: "center",
	} as const;
}

export const phoneTabBarSx = {
	bar: (t: Theme) => ({
		flex: "none",
		display: "flex",
		borderTop: 1,
		borderColor: "divider",
		bgcolor: "background.default",
		pb: `max(0px, calc(${safeAreaInsets.bottom} - ${t.tokens.density.tabBar.insetTrim}px))`,
	}),
	tab: (t: Theme) => ({
		flex: 1,
		height: t.tokens.density.tabBar.height,
		flexDirection: "column",
		justifyContent: "flex-start",
		pt: 0.75,
		gap: 0.25,
		color: "text.secondary",
		fontSize: t.tokens.density.tabBar.label,
		"&[aria-current='page']": { color: "primary.main" },
		"& .MuiSvgIcon-root": { fontSize: t.tokens.density.tabBar.icon },
	}),
	iconWrap: { position: "relative", display: "flex" },
	badge,
} as const;
