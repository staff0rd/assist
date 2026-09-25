import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router";
import { formatItemId } from "../../../../../../../../../../../backlog/formatItemId";
import { itemDetailPath } from "../../../../../../../../../../../backlog/web/ui/itemDetailPath";

export function BacklogItemLink({
	itemId,
	cwd,
}: {
	itemId: number;
	cwd?: string;
}) {
	return (
		<Link
			component={RouterLink}
			to={itemDetailPath(itemId, cwd)}
			underline="hover"
			sx={{ color: "primary.main", opacity: 0.85, whiteSpace: "nowrap" }}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		>
			{formatItemId(itemId)}
		</Link>
	);
}
