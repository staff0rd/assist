import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import type { NestedSessionRow } from "../../../../../../nestUnderBacklogRun";
import type { SessionInfo } from "../../../../../../../useSessionSocket";

const branchSx = {
	position: "relative",
	"&::before": {
		content: '""',
		position: "absolute",
		left: 0,
		top: "15px",
		width: "7px",
		height: "1px",
		bgcolor: "divider",
	},
} as const;

const nestedChildrenSx = {
	ml: "13px",
	borderLeft: 1,
	borderColor: "divider",
} as const;

export function NestedSessionRows({
	rows,
	renderCard,
}: {
	rows: NestedSessionRow[];
	renderCard: (session: SessionInfo, nested?: SessionInfo[]) => ReactNode;
}) {
	const renderBranch = (session: SessionInfo, nested?: SessionInfo[]) => (
		<Box key={session.id} sx={branchSx}>
			{renderCard(session, nested)}
		</Box>
	);
	return rows.map((row) =>
		row.children.length === 0 ? (
			renderBranch(row.session)
		) : (
			<Box key={row.session.id}>
				{renderBranch(row.session, row.children)}
				<Box sx={nestedChildrenSx}>
					{row.children.map((child) => renderBranch(child))}
				</Box>
			</Box>
		),
	);
}
