import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FilePaletteList } from "./FilePaletteResults/FilePaletteList";

const listSx = { maxHeight: 420, overflowY: "auto" } as const;
const messageSx = { px: 2, py: 2, fontSize: 13 } as const;

export function FilePaletteResults({
	message,
	files,
	highlight,
	onHighlight,
	onSelect,
}: {
	message: string | undefined;
	files: string[];
	highlight: number;
	onHighlight: (index: number) => void;
	onSelect: (path: string) => void;
}) {
	return (
		<Box sx={listSx}>
			{message ? (
				<Typography color="text.secondary" sx={messageSx}>
					{message}
				</Typography>
			) : (
				<FilePaletteList
					files={files}
					highlight={highlight}
					onHighlight={onHighlight}
					onSelect={onSelect}
				/>
			)}
		</Box>
	);
}
