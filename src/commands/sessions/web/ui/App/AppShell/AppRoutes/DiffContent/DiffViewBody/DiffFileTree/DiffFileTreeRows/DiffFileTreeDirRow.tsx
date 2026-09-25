import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import {
	diffFileTreeFileRowSx,
	diffFileTreeNameSx,
	diffFileTreeRevertSx,
	diffFileTreeRowSx,
} from "../diffFileTreeRowSx";
import { DiffFolderRevertButton } from "./DiffFileTreeDirRow/DiffFolderRevertButton";

export function DiffFileTreeDirRow({
	name,
	path,
	paths,
	collapsed,
	indent,
	onToggle,
	onRevertPaths,
}: {
	name: string;
	path: string;
	paths: string[];
	collapsed: boolean;
	indent: string;
	onToggle: () => void;
	onRevertPaths?: (paths: string[]) => void;
}) {
	return (
		<Box sx={diffFileTreeFileRowSx}>
			<ButtonBase
				onClick={onToggle}
				aria-expanded={!collapsed}
				sx={{
					...diffFileTreeRowSx,
					flex: 1,
					"&:hover": { bgcolor: "transparent" },
					pl: indent,
				}}
			>
				{collapsed ? (
					<ChevronRight fontSize="small" />
				) : (
					<ExpandMore fontSize="small" />
				)}
				<Typography
					component="span"
					color="text.secondary"
					sx={diffFileTreeNameSx}
				>
					{name}
				</Typography>
			</ButtonBase>
			{onRevertPaths && (
				<Box className="diff-tree-revert" sx={diffFileTreeRevertSx}>
					<DiffFolderRevertButton
						path={path}
						paths={paths}
						onRevert={onRevertPaths}
					/>
				</Box>
			)}
		</Box>
	);
}
