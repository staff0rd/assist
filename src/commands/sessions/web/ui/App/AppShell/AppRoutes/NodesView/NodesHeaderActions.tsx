import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";
import { AddNodeButton } from "./AddNodeButton";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { canControl } from "../nodeUpdates/canControl";
import { updateState } from "../nodeUpdates/updateState";
import type { UpdateActions } from "../nodeUpdates/useUpdateActions";

export function NodesHeaderActions({
	entries,
	actions,
	onAddNode,
}: {
	entries: NodeUpdateEntry[];
	actions: UpdateActions;
	onAddNode: () => void;
}) {
	const [checking, setChecking] = useState(false);
	const [restarting, setRestarting] = useState(false);
	const ready = entries.filter((e) => updateState(e).kind === "ready").length;
	const checkable = entries.some(
		(e) => canControl(e) && !e.status?.loop.paused,
	);
	return (
		<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
			<AddNodeButton onClick={onAddNode} />
			<Button
				variant="outlined"
				size="small"
				startIcon={<RefreshIcon />}
				disabled={!checkable || checking}
				onClick={() => {
					setChecking(true);
					void actions.checkAll(entries).finally(() => setChecking(false));
				}}
			>
				Check now
			</Button>
			<Button
				variant={ready > 0 ? "contained" : "outlined"}
				size="small"
				disabled={ready === 0 || restarting}
				onClick={() => {
					setRestarting(true);
					void actions
						.restartReady(entries)
						.finally(() => setRestarting(false));
				}}
			>
				{ready ? `Restart ready (${ready})` : "Restart ready"}
			</Button>
		</Box>
	);
}
