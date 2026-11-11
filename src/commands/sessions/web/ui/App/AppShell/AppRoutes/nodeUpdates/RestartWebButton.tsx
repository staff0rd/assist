import Button from "@mui/material/Button";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import type { UpdateActions } from "./useUpdateActions";

export function RestartWebButton({
	entry,
	actions,
}: {
	entry: NodeUpdateEntry;
	actions: UpdateActions;
}) {
	const busy = actions.notices.busy[entry.name];
	return (
		<Button
			variant="contained"
			size="small"
			disabled={busy !== undefined || !entry.webFailing?.daemon}
			onClick={() => void actions.restartWeb(entry)}
			sx={{ whiteSpace: "nowrap" }}
		>
			{busy === "Restarting" ? "Restarting…" : "Restart web server"}
		</Button>
	);
}
