import Box from "@mui/material/Box";
import { Link } from "react-router";
import { formatItemId } from "../../../../../../../backlog/formatItemId";
import { itemDetailPath } from "../../../../../../../backlog/web/ui/itemDetailPath";
import { statusPillSx } from "../../../../designSystem/statusPillSx";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { useApiNode } from "../../../../useApiNode";
import { itemRowSx } from "./itemRowSx";

const linkSx = {
	color: "text.primary",
	fontWeight: 500,
	textDecoration: "none",
	"&:hover": { textDecoration: "underline" },
} as const;

export function ItemTitle({
	item,
	cwd,
	pill,
	pillColor,
}: {
	item: AutopilotItemView;
	cwd: string;
	pill: string;
	pillColor: string;
}) {
	const node = useApiNode();
	return (
		<Box sx={itemRowSx.title}>
			<Box component="span" sx={itemRowSx.mono}>
				{formatItemId(item.id)}
			</Box>
			<Box component={Link} to={itemDetailPath(item.id, cwd, node)} sx={linkSx}>
				{item.name}
			</Box>
			<Box component="span" sx={statusPillSx(pillColor)}>
				{pill}
			</Box>
		</Box>
	);
}
