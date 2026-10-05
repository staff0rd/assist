import Button from "@mui/material/Button";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import type { UpdateActions } from "../useUpdateActions";

export function OpenFixButton({
	entry,
	actions,
}: {
	entry: NodeUpdateEntry;
	actions: UpdateActions;
}) {
	if (!entry.status?.loop.escalationId) return null;
	return (
		<Button
			variant="outlined"
			size="small"
			onClick={() => actions.openFix(entry)}
			sx={{ whiteSpace: "nowrap" }}
		>
			Open fix session
		</Button>
	);
}
