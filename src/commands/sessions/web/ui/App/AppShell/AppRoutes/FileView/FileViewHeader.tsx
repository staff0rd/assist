import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FileTypeIcon } from "../../../FileTypeIcon";
import { FileViewActions } from "./FileViewHeader/FileViewActions";
import type { FileViewMode } from "./FileViewMode";

const headerSx = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	gap: 2,
	mb: 1,
} as const;

const pathSx = { fontFamily: "monospace", fontSize: 13 } as const;

const titleSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	minWidth: 0,
} as const;

export function FileViewHeader({
	path,
	mode,
	onModeChange,
	onSave,
	saving,
	dirty,
}: {
	path: string;
	mode?: FileViewMode;
	onModeChange: (mode: FileViewMode) => void;
	onSave: () => void;
	saving: boolean;
	dirty: boolean;
}) {
	return (
		<Box sx={headerSx}>
			<Box sx={titleSx}>
				<FileTypeIcon path={path} />
				<Typography color="text.secondary" sx={pathSx}>
					{path}
				</Typography>
			</Box>
			<FileViewActions
				mode={mode}
				onModeChange={onModeChange}
				onSave={onSave}
				saving={saving}
				dirty={dirty}
			/>
		</Box>
	);
}
