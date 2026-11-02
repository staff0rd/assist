import { Box, Divider } from "@mui/material";
import type { ReactNode, Ref } from "react";
import type { ViewType } from "react-diff-view";
import { DiffViewTypeToggle } from "../../../DiffViewTypeToggle";
import { HighLevelBulkButtons } from "../HighLevelBulkButtons";
import { HighLevelMatchBar } from "./HighLevelStructureToolbar/HighLevelMatchBar";
import { HighLevelResetButton } from "./HighLevelStructureToolbar/HighLevelResetButton";
import {
	highLevelStructureToolbarRowSx,
	highLevelStructureToolbarSx,
} from "../highLevelStructureToolbarSx";
import type { HighLevelStructureBulk } from "./highLevelStructureBulk";

export function HighLevelStructureToolbar({
	ref,
	bulk,
	viewType,
	onChangeViewType,
	matches,
	children,
	...match
}: {
	ref: Ref<HTMLDivElement>;
	children?: ReactNode;
	bulk: HighLevelStructureBulk;
	viewType: ViewType;
	onChangeViewType: (viewType: ViewType) => void;
	glob: string;
	onChangeGlob: (glob: string) => void;
	matches: Set<string>;
	quickGlobs: string[];
}) {
	return (
		<Box
			ref={ref}
			role="toolbar"
			aria-label="Changed files controls"
			sx={highLevelStructureToolbarSx}
		>
			{children}
			<Box sx={highLevelStructureToolbarRowSx}>
				<HighLevelBulkButtons bulk={bulk} />
				<Divider orientation="vertical" flexItem />
				<HighLevelResetButton changes={bulk.changes} onReset={bulk.reset} />
				<Box sx={{ ml: "auto" }}>
					<DiffViewTypeToggle viewType={viewType} onChange={onChangeViewType} />
				</Box>
			</Box>
			<Box sx={highLevelStructureToolbarRowSx}>
				<HighLevelMatchBar
					{...match}
					matches={matches}
					onShow={() => bulk.show(matches)}
					onHide={() => bulk.hide(matches)}
				/>
			</Box>
		</Box>
	);
}
