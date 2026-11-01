import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { bulkRevertMessage } from "../../bulkRevertMessage";
import {
	diffFileTreeHeaderSx,
	diffFileTreeNameSx,
	diffFileTreeRevertSx,
} from "./diffFileTreeRowSx";
import { DiffRevertIconButton } from "./DiffRevertIconButton";

export function DiffFileTreeHeader({
	paths,
	uncommittedOnly = false,
	onRevertPaths,
}: {
	paths: string[];
	uncommittedOnly?: boolean;
	onRevertPaths: (paths: string[]) => void;
}) {
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
					confirmMessage={bulkRevertMessage(
						paths.length,
						"listed in the tree",
						uncommittedOnly,
					)}
					onConfirm={() => onRevertPaths(paths)}
				/>
			</Box>
		</Box>
	);
}
