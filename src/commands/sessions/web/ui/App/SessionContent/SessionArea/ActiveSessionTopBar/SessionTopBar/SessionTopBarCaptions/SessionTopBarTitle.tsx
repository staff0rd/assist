import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BacklogItemChip } from "../../../../../BacklogItemChip";
import { sessionTitle } from "../../../../../sessionTitle";
import type { SessionInfo } from "../../../../../../types";

const rowSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.75,
	minWidth: 0,
} as const;

const titleSx = {
	color: "text.primary",
	fontSize: "1.25rem",
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function SessionTopBarTitle({ session }: { session: SessionInfo }) {
	const itemId = session.activity?.itemId;
	return (
		<Box sx={rowSx}>
			{itemId != null && <BacklogItemChip itemId={itemId} cwd={session.cwd} />}
			<Typography variant="body1" sx={titleSx}>
				{sessionTitle(session)}
			</Typography>
		</Box>
	);
}
