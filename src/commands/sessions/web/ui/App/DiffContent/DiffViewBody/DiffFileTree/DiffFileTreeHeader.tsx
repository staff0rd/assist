import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
	diffFileTreeHeaderSx,
	diffFileTreeNameSx,
	diffFileTreeRevertSx,
} from "./diffFileTreeRowSx";
import { DiffRevertIconButton } from "./DiffRevertIconButton";

export function DiffFileTreeHeader({
	paths,
	onRevertPaths,
}: {
	paths: string[];
	onRevertPaths: (paths: string[]) => void;
}) {
	const label = paths.length === 1 ? "file" : "files";

	return (
		<Box sx={diffFileTreeHeaderSx}>
			<Typography
				component="span"
				color="text.secondary"
				sx={{ ...diffFileTreeNameSx, fontWeight: 600 }}
			>
				Changed files
			</Typography>
			<Box className="diff-tree-revert" sx={diffFileTreeRevertSx}>
				<DiffRevertIconButton
					label="Revert all files"
					title="Revert uncommitted changes to every listed file"
					confirmTitle="Revert all files"
					confirmMessage={`This discards all uncommitted changes to ${paths.length} ${label} listed in the tree. This cannot be undone.`}
					onConfirm={() => onRevertPaths(paths)}
				/>
			</Box>
		</Box>
	);
}
