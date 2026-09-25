import Box from "@mui/material/Box";
import { useRef } from "react";
import {
	type DiffToolbarActionProps,
	DiffToolbarActions,
} from "./DiffToolbar/DiffToolbarActions";
import {
	type DiffToolbarControlProps,
	DiffToolbarControls,
} from "./DiffToolbarControls";
import { DiffToolbarRule } from "./DiffToolbar/DiffToolbarRule";
import {
	type DiffToolbarSubjectProps,
	DiffToolbarSubject,
} from "./DiffToolbarSubject";
import { DiffTreeToggle } from "./DiffToolbar/DiffTreeToggle";
import { useElementWidth } from "../useElementWidth";

export const DIFF_TOOLBAR_HEIGHT = 40;

const COMPACT_WIDTH = 400;

const toolbarSx = {
	position: "sticky",
	top: 0,
	zIndex: 2,
	minHeight: DIFF_TOOLBAR_HEIGHT,
	display: "flex",
	alignItems: "center",
	flexWrap: "wrap",
	gap: 0.5,
	px: 0.5,
	bgcolor: "background.default",
	borderBottom: 1,
	borderColor: "divider",
} as const;

type DiffToolbarProps = DiffToolbarSubjectProps &
	DiffToolbarControlProps &
	DiffToolbarActionProps & {
		treeVisible: boolean;
		onToggleTree: () => void;
	};

export function DiffToolbar(props: DiffToolbarProps) {
	const barRef = useRef<HTMLDivElement>(null);
	const width = useElementWidth(barRef);
	const compact = width !== null && width < COMPACT_WIDTH;

	return (
		<Box ref={barRef} sx={toolbarSx}>
			<DiffTreeToggle
				treeVisible={props.treeVisible}
				onToggleTree={props.onToggleTree}
			/>
			<DiffToolbarRule />
			<DiffToolbarSubject {...props} compact={compact} />
			<Box sx={{ ml: "auto" }} />
			<DiffToolbarControls {...props} />
			<DiffToolbarActions {...props} />
		</Box>
	);
}
