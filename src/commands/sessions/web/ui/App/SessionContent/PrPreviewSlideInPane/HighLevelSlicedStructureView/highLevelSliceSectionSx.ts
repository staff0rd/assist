import { highLevelStructureStickyTop } from "../highLevelStructureToolbarSx";

export const highLevelSliceSectionSx = {
	borderTop: 1,
	borderColor: "divider",
	pt: 1.25,
	display: "flex",
	flexDirection: "column",
	gap: 0.5,
	minWidth: 0,
	scrollMarginTop: highLevelStructureStickyTop,
} as const;
