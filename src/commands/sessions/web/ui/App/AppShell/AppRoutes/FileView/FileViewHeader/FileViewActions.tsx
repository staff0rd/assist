import SaveIcon from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { CloseViewButton } from "../../CloseViewButton";
import type { FileViewMode } from "../FileViewMode";

const actionsSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	flexShrink: 0,
} as const;

export function FileViewActions({
	mode,
	onModeChange,
	onSave,
	saving,
	dirty,
}: {
	mode?: FileViewMode;
	onModeChange: (mode: FileViewMode) => void;
	onSave: () => void;
	saving: boolean;
	dirty: boolean;
}) {
	return (
		<Box sx={actionsSx}>
			{mode && (
				<ToggleButtonGroup
					exclusive
					size="small"
					value={mode}
					onChange={(_, next: FileViewMode | null) =>
						next && onModeChange(next)
					}
				>
					<ToggleButton value="raw">Raw</ToggleButton>
					<ToggleButton value="rendered">Rendered</ToggleButton>
				</ToggleButtonGroup>
			)}
			<Button
				size="small"
				variant="outlined"
				startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
				onClick={onSave}
				disabled={saving || !dirty}
				title="Save (Ctrl+S)"
			>
				Save
			</Button>
			<CloseViewButton />
		</Box>
	);
}
