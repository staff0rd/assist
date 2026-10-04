import Box from "@mui/material/Box";
import { alpha, type Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { NodeUpdateEntry } from "../../../../NodeUpdateEntry";
import { restartLabel } from "../../restartLabel";
import type { UpdateState } from "../../updateState";

const bannerSx = (tone: "warning" | "error") => (t: Theme) => ({
	p: 1.5,
	borderRadius: 1,
	bgcolor: alpha(t.palette[tone].main, 0.1),
});

export function Advice({
	entry,
	state,
}: {
	entry: NodeUpdateEntry;
	state: UpdateState;
}) {
	const status = entry.status;
	if (!status) return null;
	if (state.kind === "ready")
		return (
			<Box sx={bannerSx("warning")}>
				<Typography variant="body2">
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
			</Box>
		);
	if (state.kind === "diverged")
		return (
			<Box sx={bannerSx("error")}>
				<Typography variant="body2">
					<b>{entry.name}'s install can't fast-forward to origin.</b> A Claude
					session
					{status.loop.escalationId
						? ` (${status.loop.escalationId})`
						: ""} is
					reconciling it. The update loop resumes when that session closes.
				</Typography>
			</Box>
		);
	return null;
}
