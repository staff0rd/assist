import { Stack } from "@mui/material";
import type { BacklogItem } from "../types";
import { itemDetailLayout } from "./itemDetailLayout";
import { itemNavSections } from "./itemNavSections";
import { ItemNavigatorRow } from "./ItemNavigatorRow";
import { pinnedHeaderHeight } from "./itemSectionAnchor";
import { useActiveSection } from "./useActiveSection";

const APP_BAR_HEIGHT = 48;
const NAVIGATOR_WIDTH = 260;

const panelSx = {
	display: "none",
	[itemDetailLayout.wideQuery]: { display: "flex" },
	position: "sticky",
	top: pinnedHeaderHeight,
	alignSelf: "flex-start",
	width: NAVIGATOR_WIDTH,
	flexShrink: 0,
	maxHeight: `calc(100vh - ${APP_BAR_HEIGHT}px - ${pinnedHeaderHeight})`,
	alignItems: "flex-start",
	overflowY: "auto",
	overflowX: "hidden",
	py: 2,
} as const;

function scrollToSection(id: string) {
	document
		.getElementById(id)
		?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ItemNavigator({
	item,
	headerHeight,
}: {
	item: BacklogItem;
	headerHeight: number;
}) {
	const sections = itemNavSections(item);
	const activeId = useActiveSection(
		sections.map((section) => section.id),
		headerHeight,
	);
	if (sections.length === 0) return null;
	return (
		<Stack component="nav" spacing={1} sx={panelSx}>
			{sections.map((section) => (
				<ItemNavigatorRow
					key={section.id}
					section={section}
					active={section.id === activeId}
					onSelect={scrollToSection}
				/>
			))}
		</Stack>
	);
}
