import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router";
import { formatItemId } from "../../../../../../../../../../../backlog/formatItemId";
import { itemDetailPath } from "../../../../../../../../../../../backlog/web/ui/itemDetailPath";
import { tokenBadgeSx } from "../../../../../../../../designSystem/tokenBadgeSx";
import { repoGroupCwd } from "../../../../../../../../repoGroupKey";
import type { SessionInfo } from "../../../../../../../../types";
import { useApiNode } from "../../../../../../../../useApiNode";

const sx = tokenBadgeSx("primary");

export function BacklogItemLink({
	itemId,
	session,
}: {
	itemId: number;
	session: SessionInfo;
}) {
	const node = useApiNode();
	return (
		<Link
			component={RouterLink}
			to={itemDetailPath(itemId, repoGroupCwd(session), node)}
			underline="hover"
			sx={sx}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		>
			{formatItemId(itemId)}
		</Link>
	);
}
