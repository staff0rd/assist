import Link from "@mui/material/Link";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";
import { formatItemId } from "../../../backlog/formatItemId";
import { itemDetailPath } from "../../../backlog/web/ui/itemDetailPath";

const nameSx = {
	display: "block",
	fontWeight: 500,
	maxWidth: "36ch",
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

const metaSx = {
	display: "block",
	mt: "2px",
	fontSize: "0.75rem",
	color: "text.secondary",
	whiteSpace: "nowrap",
} as const;

export function UsageItemNameCell({
	id,
	name,
	type,
}: {
	id: number;
	name: string;
	type: string;
}) {
	return (
		<TableCell>
			<Link
				component={RouterLink}
				to={itemDetailPath(id)}
				underline="hover"
				color="text.primary"
				title={name}
				sx={nameSx}
			>
				{name}
			</Link>
			<Typography component="span" sx={metaSx}>
				{formatItemId(id)} · {type}
			</Typography>
		</TableCell>
	);
}
