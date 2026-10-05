import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import { OpenFixButton } from "./OpenFixButton";
import { RestartNodeButton } from "./RestartNodeButton";
import type { UpdateState } from "../UpdateStateKind";
import type { UpdateActions } from "../useUpdateActions";
import { canControl } from "../canControl";

const actionsSx = {
	display: "flex",
	gap: 0.5,
	flexWrap: "wrap",
	justifyContent: { xs: "flex-start", sm: "flex-end" },
	gridColumn: { xs: "1 / -1", sm: "auto" },
} as const;

export function RowActions({
	entry,
	state,
	actions,
}: {
	entry: NodeUpdateEntry;
	state: UpdateState;
	actions: UpdateActions;
}) {
	const busy = actions.notices.busy[entry.name];
	const paused = entry.status?.loop.paused === true;
	return (
		<Box sx={actionsSx}>
			{state.kind === "ready" && (
				<RestartNodeButton entry={entry} actions={actions} />
			)}
			{state.kind === "diverged" && (
				<OpenFixButton entry={entry} actions={actions} />
			)}
			{canControl(entry) && (
				<Button
					size="small"
					disabled={busy !== undefined}
					onClick={() =>
						void actions.control(entry, paused ? "resume" : "pause")
					}
				>
					{paused ? "Resume" : "Pause"}
				</Button>
			)}
		</Box>
	);
}
