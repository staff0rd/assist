import Chip from "@mui/material/Chip";
import { Link } from "react-router";
import { formatItemId } from "../../../../backlog/formatItemId";
import { itemDetailPath } from "../../../../backlog/web/ui/itemDetailPath";
import { useApiNode } from "../useApiNode";

const chipSx = { height: 18, fontSize: "0.65rem", flexShrink: 0 };

export function BacklogItemChip({
	itemId,
	cwd,
}: {
	itemId: number;
	cwd?: string;
}) {
	const node = useApiNode();
	return (
		<Chip
			label={formatItemId(itemId)}
			size="small"
			sx={chipSx}
			clickable
			component={Link}
			to={itemDetailPath(itemId, cwd, node)}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		/>
	);
}
