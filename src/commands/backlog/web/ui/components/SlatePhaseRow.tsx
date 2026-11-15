import { Box, ButtonBase } from "@mui/material";
import type { ItemNavSection } from "./itemNavSections";
import { slatePhaseCircleSx } from "./slatePhaseCircleSx";
import { slatePhaseRowSx } from "./slatePhaseRowSx";

export function SlatePhaseRow({
	section,
	active,
	onSelect,
}: {
	section: ItemNavSection;
	active: boolean;
	onSelect: (id: string) => void;
}) {
	return (
		<ButtonBase
			sx={slatePhaseRowSx(active)}
			onClick={() => onSelect(section.id)}
			title={section.title}
			aria-current={active ? "true" : undefined}
		>
			<Box component="i" sx={slatePhaseCircleSx(section.status)}>
				{section.label}
			</Box>
			<Box component="span" className="phase-label">
				{section.title}
				{section.caption && (
					<Box component="span" className="phase-caption">
						{section.caption}
					</Box>
				)}
			</Box>
		</ButtonBase>
	);
}
