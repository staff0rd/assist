import Box from "@mui/material/Box";
import type { groupSessionsByRepo } from "../../../../groupSessionsByRepo";
import type { NestedSessionRow } from "../../../../nestUnderBacklogRun";
import { SessionGroupSection } from "./SessionGroupItem/SessionGroupSection";
import { SessionListCard } from "./SessionGroupItem/SessionListCard";
import type { SessionListHandlers } from "../../../../../../types";
import type { SessionInfo } from "../../../../../../useSessionSocket";

type SessionCardProps = {
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
} & SessionListHandlers;

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

export function SessionGroupItem({
	group,
	cardProps,
}: {
	group: ReturnType<typeof groupSessionsByRepo>[number];
	cardProps: SessionCardProps;
}) {
	const renderCard = (session: SessionInfo) => (
		<SessionListCard key={session.id} session={session} {...cardProps} />
	);
	const renderBranch = (session: SessionInfo) => (
		<Box key={session.id} sx={branchSx}>
			{renderCard(session)}
		</Box>
	);
	const renderRow = (row: NestedSessionRow) =>
		row.children.length === 0 ? (
			renderBranch(row.session)
		) : (
			<Box key={row.session.id}>
				{renderBranch(row.session)}
				<Box sx={nestedChildrenSx}>{row.children.map(renderBranch)}</Box>
			</Box>
		);
	return group.kind === "single" ? (
		renderCard(group.session)
	) : (
		<SessionGroupSection label={group.label} count={countRows(group.rows)}>
			{group.rows.map(renderRow)}
		</SessionGroupSection>
	);
}

function countRows(rows: NestedSessionRow[]): number {
	return rows.reduce((total, row) => total + 1 + row.children.length, 0);
}
