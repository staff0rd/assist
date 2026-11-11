import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useNodeSelectionContext } from "../../../useNodeSelectionContext";
import { PageShell } from "../../PageShell";
import { PeerSnackbars } from "../PeerSnackbars";
import { LinkedNodeRow } from "./NodesView/LinkedNodeRow";
import { NoLinkedNodes } from "./NodesView/NoLinkedNodes";
import { nodesSummary } from "./NodesView/nodesSummary";
import { ThisNodeRow } from "./NodesView/ThisNodeRow";
import { useNodeRemoval } from "./NodesView/useNodeRemoval";

export function NodesView() {
	const { nodes } = useNodeSelectionContext();
	const { removed, remove, notices } = useNodeRemoval(nodes);
	const links = (nodes?.links ?? []).filter((link) => !removed.has(link.name));

	return (
		<PageShell
			loading={!nodes}
			header={
				<>
					<Typography variant="h5" component="h1">
						Nodes
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						{nodesSummary(links)}
					</Typography>
				</>
			}
		>
			<Paper variant="outlined" component="section" aria-label="Nodes">
				{nodes && <ThisNodeRow name={nodes.local} />}
				{links.length === 0 && <NoLinkedNodes />}
				{links.map((link) => (
					<LinkedNodeRow key={link.name} link={link} onRemove={remove} />
				))}
			</Paper>
			<PeerSnackbars notices={notices} />
		</PageShell>
	);
}
