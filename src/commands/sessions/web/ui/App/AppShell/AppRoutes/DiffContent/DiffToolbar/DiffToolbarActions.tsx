import Typography from "@mui/material/Typography";
import { CloseViewButton } from "../../CloseViewButton";
import { DiffModeToggle } from "./DiffToolbarActions/DiffModeToggle";
import { DiffToolbarRule } from "./DiffToolbarRule";
import type { DiffPanelMode } from "../../toggleDiffPanel";

export type DiffToolbarActionProps = {
	commentHint?: string;
	mode?: DiffPanelMode;
	onToggleMode?: () => void;
	onClose?: () => void;
};

export function DiffToolbarActions({
	commentHint,
	mode,
	onToggleMode,
	onClose,
}: DiffToolbarActionProps) {
	return (
		<>
			{commentHint ? (
				<Typography variant="caption" color="text.secondary" noWrap>
					{commentHint}
				</Typography>
			) : null}
			<DiffToolbarRule />
			{mode !== undefined && onToggleMode !== undefined && (
				<DiffModeToggle mode={mode} onToggleMode={onToggleMode} />
			)}
			<CloseViewButton onClose={onClose} />
		</>
	);
}
