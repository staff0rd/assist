import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { NodeUpdateStatus } from "../../../../../../../../../shared/NodeUpdateStatus";
import type { NodeUpdateEntry } from "../../../../../NodeUpdateEntry";
import { RestartNodeButton } from "../../RestartNodeButton";
import { restartLabel } from "../../../restartLabel";
import type { UpdateActions } from "../../../useUpdateActions";
import { bannerSx, bannerTextSx } from "./bannerSx";

export function ReadyAdvice({
	entry,
	status,
	actions,
}: {
	entry: NodeUpdateEntry;
	status: NodeUpdateStatus;
	actions: UpdateActions;
}) {
	return (
		<Box sx={bannerSx("warning")}>
			<Typography variant="body2" sx={bannerTextSx}>
				<b>
					{status.running === status.built
						? "New code is built but not running."
						: `v${status.built} is built but not running.`}
				</b>{" "}
				Restart the {status.restart.map(restartLabel).join(" and ")} on{" "}
				{entry.name} to load it.
				{status.restart.includes("daemon") &&
					" Open sessions are restored after the daemon restarts."}
			</Typography>
			<RestartNodeButton entry={entry} actions={actions} spellOut />
		</Box>
	);
}
