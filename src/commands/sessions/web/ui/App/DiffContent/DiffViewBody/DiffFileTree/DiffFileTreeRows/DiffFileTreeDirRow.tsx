import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import {
	diffFileTreeFileRowSx,
	diffFileTreeNameSx,
	diffFileTreeRowSx,
} from "../diffFileTreeRowSx";
import { slateTreeDirSx } from "../slateTreeSx";
import { DiffFileTreeDirRowRevert } from "./DiffFileTreeDirRow/DiffFileTreeDirRowRevert";

export function DiffFileTreeDirRow({
	name,
	path,
	paths,
	collapsed,
	indent,
	onToggle,
	uncommittedOnly,
	onRevertPaths,
}: {
	name: string;
	path: string;
	paths: string[];
	collapsed: boolean;
	indent: string;
	onToggle: () => void;
	uncommittedOnly?: boolean;
	onRevertPaths?: (paths: string[]) => void;
}) {
	return (
		<Box sx={[diffFileTreeFileRowSx, slateTreeDirSx]}>
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
			<DiffFileTreeDirRowRevert
				path={path}
				paths={paths}
				uncommittedOnly={uncommittedOnly}
				onRevertPaths={onRevertPaths}
			/>
		</Box>
	);
}
