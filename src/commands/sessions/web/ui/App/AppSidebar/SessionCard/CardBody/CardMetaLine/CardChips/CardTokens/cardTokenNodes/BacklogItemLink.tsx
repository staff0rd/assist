import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router";
import { formatItemId } from "../../../../../../../../../../../backlog/formatItemId";
import { itemDetailPath } from "../../../../../../../../../../../backlog/web/ui/itemDetailPath";
import { useApiNode } from "../../../../../../../../useApiNode";

export function BacklogItemLink({
	itemId,
	cwd,
}: {
	itemId: number;
	cwd?: string;
}) {
	const node = useApiNode();
	return (
		<Link
			component={RouterLink}
			to={itemDetailPath(itemId, cwd, node)}
			underline="hover"
			sx={{ color: "primary.main", opacity: 0.85, whiteSpace: "nowrap" }}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		>
			{formatItemId(itemId)}
		</Link>
	);
}
