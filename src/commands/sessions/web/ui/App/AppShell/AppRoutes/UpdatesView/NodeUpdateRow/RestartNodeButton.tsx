import Button from "@mui/material/Button";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import { restartLabel } from "../restartLabel";
import type { UpdateActions } from "../useUpdateActions";

export function RestartNodeButton({
	entry,
	actions,
	spellOut = false,
}: {
	entry: NodeUpdateEntry;
	actions: UpdateActions;
	spellOut?: boolean;
}) {
	const busy = actions.notices.busy[entry.name];
	const what = entry.status?.restart.map(restartLabel).join(" + ") ?? "";
	return (
		<Button
			variant="contained"
			size="small"
			disabled={busy !== undefined}
			onClick={() => void actions.restart(entry)}
			sx={{ whiteSpace: "nowrap" }}
		>
			{busy === "Restarting"
				? "Restarting…"
				: spellOut
					? `Restart ${what}`
					: "Restart"}
		</Button>
	);
}
