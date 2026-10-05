import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { NodeUpdateEntry } from "../../../../../NodeUpdateEntry";
import { OpenFixButton } from "../../OpenFixButton";
import type { UpdateActions } from "../../../useUpdateActions";
import { bannerSx, bannerTextSx } from "./bannerSx";

export function DivergedAdvice({
	entry,
	actions,
}: {
	entry: NodeUpdateEntry;
	actions: UpdateActions;
}) {
	const escalationId = entry.status?.loop.escalationId;
	return (
		<Box sx={bannerSx("error")}>
			<Typography variant="body2" sx={bannerTextSx}>
				<b>{entry.name}'s install can't fast-forward to origin.</b> A Claude
				session{escalationId ? ` (${escalationId})` : ""} is reconciling it. The
				update loop resumes when that session closes.
			</Typography>
			<OpenFixButton entry={entry} actions={actions} />
		</Box>
	);
}
