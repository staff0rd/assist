import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { updateState } from "./updateState";
import type { UpdateActions } from "./useUpdateActions";
import { canControl } from "./canControl";

export function UpdatesHeaderActions({
	entries,
	actions,
}: {
	entries: NodeUpdateEntry[];
	actions: UpdateActions;
}) {
	const [checking, setChecking] = useState(false);
	const [restarting, setRestarting] = useState(false);
	const ready = entries.filter((e) => updateState(e).kind === "ready").length;
	const checkable = entries.some(
		(e) => canControl(e) && !e.status?.loop.paused,
	);
	return (
		<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
				variant="contained"
				size="small"
				disabled={ready === 0 || restarting}
				onClick={() => {
					setRestarting(true);
					void actions
						.restartReady(entries)
						.finally(() => setRestarting(false));
				}}
			>
				{ready ? `Restart ready nodes (${ready})` : "Restart ready nodes"}
			</Button>
		</Box>
	);
}
