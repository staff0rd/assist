import Box from "@mui/material/Box";
import GlobalStyles from "@mui/material/GlobalStyles";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { STATUS_BAR_HEIGHT_VAR } from "./statusBarInset";

const STATUS_BAR_HEIGHT = 28;

const insetStyles = {
	":root": { [STATUS_BAR_HEIGHT_VAR]: `${STATUS_BAR_HEIGHT}px` },
};

const barSx = {
	position: "fixed",
	left: 0,
	right: 0,
	bottom: 0,
	height: STATUS_BAR_HEIGHT,
	zIndex: (t: Theme) => t.zIndex.appBar,
	display: "flex",
	alignItems: "center",
	gap: 0.5,
	px: 0.75,
	borderTop: 1,
	borderColor: "divider",
	bgcolor: (t: Theme) => t.tokens.color.statusBar?.background,
	color: (t: Theme) => t.tokens.color.statusBar?.text,
	fontFamily: "fontFamilyMono",
	fontSize: "11.5px",
	whiteSpace: "nowrap",
	minWidth: 0,
} as const;

const sideSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.5,
	minWidth: 0,
} as const;

export function StatusBar({
	start,
	end,
}: {
	start: ReactNode;
	end: ReactNode;
}) {
	return (
		<>
			<GlobalStyles styles={insetStyles} />
			<Box component="footer" data-testid="status-bar" sx={barSx}>
				<Box sx={sideSx}>{start}</Box>
				<Box sx={{ flex: 1 }} />
				<Box sx={sideSx}>{end}</Box>
			</Box>
		</>
	);
}
