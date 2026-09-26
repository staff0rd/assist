export const ITEM_SECTION_IDS = {
	description: "item-section-description",
	acceptanceCriteria: "item-section-acceptance-criteria",
	subtasks: "item-section-subtasks",
	plan: "item-section-plan",
	activity: "item-section-activity",
	comments: "item-section-comments",
} as const;

type ItemSectionKey = keyof typeof ITEM_SECTION_IDS;

export const DEFAULT_PINNED_HEADER_HEIGHT = 140;

export const PINNED_HEADER_HEIGHT_VAR = "--pinned-header-height";

export const pinnedHeaderHeight = `var(${PINNED_HEADER_HEIGHT_VAR}, ${DEFAULT_PINNED_HEADER_HEIGHT}px)`;

const scrollMarginTop = `calc(${pinnedHeaderHeight} + 8px)`;

export function itemSectionAnchor(key: ItemSectionKey) {
	return {
		id: ITEM_SECTION_IDS[key],
		sx: { mb: 2, scrollMarginTop },
	};
}

export function phaseAnchor(index: number) {
	return {
		id: `item-phase-${index}`,
		sx: { scrollMarginTop },
	};
}
