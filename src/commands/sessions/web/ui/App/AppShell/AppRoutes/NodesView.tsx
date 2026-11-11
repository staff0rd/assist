import Paper from "@mui/material/Paper";
import { useNodeSelectionContext } from "../../../useNodeSelectionContext";
import { PageShell } from "../../PageShell";
import { PeerSnackbars } from "../PeerSnackbars";
import { useNodeUpdatesContext } from "../useNodeUpdatesContext";
import { useUpdateActions } from "./nodeUpdates/useUpdateActions";
import { NodeRow } from "./NodesView/NodeRow";
import { NodesHeader } from "./NodesView/NodesHeader";
import { nodeRows } from "./NodesView/nodeRows";
import { pageNotices } from "./NodesView/pageNotices";
import { useNodeRemoval } from "./NodesView/useNodeRemoval";

export function NodesView({
	selectSession,
}: {
	selectSession: (id: string) => void;
}) {
	const { nodes } = useNodeSelectionContext();
	const { entries } = useNodeUpdatesContext();
	const actions = useUpdateActions(selectSession);
	const removal = useNodeRemoval(nodes);
	const rows = nodes
		? nodeRows(nodes, entries, removal.removed, globalThis.location.origin)
		: [];

	return (
		<PageShell
			loading={!nodes}
			header={<NodesHeader rows={rows} actions={actions} />}
		>
			<Paper variant="outlined" component="section" aria-label="Nodes">
				{rows.map((row) => (
					<NodeRow
						key={row.name}
						row={row}
						actions={actions}
						onRemove={removal.remove}
					/>
				))}
			</Paper>
			<PeerSnackbars notices={pageNotices(actions, removal.notices)} />
		</PageShell>
	);
}
