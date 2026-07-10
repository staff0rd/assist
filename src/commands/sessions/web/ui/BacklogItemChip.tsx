import Chip from "@mui/material/Chip";
import { Link } from "react-router";
import { formatItemId } from "../../../backlog/formatItemId";
import { itemDetailPath } from "../../../backlog/web/ui/itemDetailPath";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function BacklogItemChip({
	itemId,
	cwd,
}: {
	itemId: number;
	cwd?: string;
}) {
	return (
		<Chip
			label={formatItemId(itemId)}
			size="small"
			sx={chipSx}
			clickable
			component={Link}
			to={itemDetailPath(itemId, cwd)}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		/>
	);
}
