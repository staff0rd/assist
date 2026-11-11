import Typography from "@mui/material/Typography";
import { NodeUpdateDetail } from "../../../nodeUpdates/NodeUpdateDetail";
import type { UpdateActions } from "../../../nodeUpdates/useUpdateActions";
import type { NodeRowData } from "../../nodeRows";
import { Panel } from "./Panel";

const waitingFor: Record<string, string> = {
	disconnected: "Update state comes back when the link reconnects.",
	connecting: "Update state shows once the link connects.",
	"version-blocked":
		"Update state shows once both nodes run the same link protocol.",
};

export function UpdatesPanel({
	row,
	actions,
}: {
	row: NodeRowData;
	actions: UpdateActions;
}) {
	return (
		<Panel title="Updates">
			{row.entry ? (
				<NodeUpdateDetail entry={row.entry} actions={actions} />
			) : (
				<Typography variant="body2" color="text.secondary">
					{(row.link && waitingFor[row.link.state]) ?? "Waiting for the node."}
				</Typography>
			)}
		</Panel>
	);
}
