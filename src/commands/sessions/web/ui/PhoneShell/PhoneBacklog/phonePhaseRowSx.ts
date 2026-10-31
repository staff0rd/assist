import type { Theme } from "@mui/material/styles";
import type { PhaseStatus } from "../../../../../backlog/web/ui/types";

export const phaseGlyph: Record<PhaseStatus, string> = {
	done: "✓",
	current: "▶",
	upcoming: "○",
};

const glyphColor: Record<PhaseStatus, string> = {
	done: "info.main",
	current: "primary.main",
	upcoming: "text.disabled",
};

const rowSx = {
	width: "100%",
	display: "grid",
	gridTemplateColumns: "24px 1fr",
	columnGap: 1.25,
	rowGap: 0.25,
	alignItems: "start",
	textAlign: "left",
	px: 2,
	py: 1.25,
	borderBottom: 1,
	borderColor: (t: Theme) => t.tokens.color.lineSoft,
} as const;

const currentSx = { bgcolor: (t: Theme) => t.tokens.color.selected } as const;

export function phonePhaseRowSx(status: PhaseStatus) {
	return [rowSx, status === "current" ? currentSx : {}];
}

export function phaseGlyphSx(status: PhaseStatus) {
	return {
		fontFamily: "fontFamilyMono",
		fontSize: 13,
		lineHeight: "21px",
		textAlign: "center",
		color: glyphColor[status],
	} as const;
}

export const phaseNameSx = {
	fontSize: 16,
	fontWeight: 600,
	lineHeight: "21px",
} as const;
