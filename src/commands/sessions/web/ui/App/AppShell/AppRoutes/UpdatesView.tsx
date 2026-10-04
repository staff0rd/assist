import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useNodeUpdatesContext } from "../useNodeUpdatesContext";
import { PageShell } from "../../PageShell";
import { NodeUpdateRow } from "./UpdatesView/NodeUpdateRow";
import { updatesSummary } from "./UpdatesView/updatesSummary";

export function UpdatesView() {
	const { entries, loading } = useNodeUpdatesContext();

	return (
		<PageShell
			loading={loading}
			header={
				<>
					<Typography variant="h5" component="h1">
						Updates
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						{updatesSummary(entries)}
					</Typography>
				</>
			}
		>
			<Paper variant="outlined" component="section" aria-label="Nodes">
				{entries.map((entry) => (
					<NodeUpdateRow key={entry.name} entry={entry} />
				))}
			</Paper>
		</PageShell>
	);
}
