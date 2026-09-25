import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { diffChangeTypeLabel } from "./diffChangeTypeOptions";
import type { DiffChangeType } from "./filterDiffFiles";

const chipSx = {
	flex: "0 0 auto",
	display: "flex",
	alignItems: "center",
	gap: 0.25,
	height: 22,
	pl: 1,
	pr: 0.25,
	borderRadius: 11,
	bgcolor: "action.selected",
	fontSize: 12,
	whiteSpace: "nowrap",
} as const;

export function DiffChangeTypeChip({
	changeType,
	onClear,
}: {
	changeType: DiffChangeType;
	onClear: () => void;
}) {
	const label = diffChangeTypeLabel(changeType);
	const clearLabel = `Clear the ${label} filter`;

	return (
		<Box sx={chipSx}>
			{label}
			<IconButton
				size="small"
				title={clearLabel}
				aria-label={clearLabel}
				onClick={onClear}
				sx={{ p: 0.25, color: "text.secondary" }}
			>
				<CloseIcon sx={{ fontSize: 12 }} />
			</IconButton>
		</Box>
	);
}
