import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { PeerSnackbars } from "../PeerSnackbars";
import { useNodeUpdatesContext } from "../useNodeUpdatesContext";
import { PageShell } from "../../PageShell";
import { NodeUpdateRow } from "./UpdatesView/NodeUpdateRow";
import { UpdatesHeaderActions } from "./UpdatesView/UpdatesHeaderActions";
import { updatesSummary } from "./UpdatesView/updatesSummary";
import { useUpdateActions } from "./UpdatesView/useUpdateActions";

export function UpdatesView({
	reconnecting,
	selectSession,
}: {
	reconnecting: boolean;
	selectSession: (id: string) => void;
}) {
	const { entries, loading } = useNodeUpdatesContext();
	const actions = useUpdateActions(reconnecting, selectSession);
	const { notices } = actions;

	return (
		<PageShell
			loading={loading}
			header={
				<Box
					sx={{
						display: "flex",
						alignItems: "flex-end",
						gap: 2,
						flexWrap: "wrap",
						mb: 3,
					}}
				>
					<Box sx={{ flex: "1 1 auto" }}>
						<Typography variant="h5" component="h1">
							Updates
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{updatesSummary(entries)}
						</Typography>
					</Box>
					<UpdatesHeaderActions entries={entries} actions={actions} />
				</Box>
			}
		>
			<Paper variant="outlined" component="section" aria-label="Nodes">
				{entries.map((entry) => (
					<NodeUpdateRow key={entry.name} entry={entry} actions={actions} />
				))}
			</Paper>
			<PeerSnackbars
				notices={{
					...notices,
					error: notices.error ?? actions.localError,
					clearError: () => {
						notices.clearError();
						actions.clearLocalError();
					},
				}}
			/>
		</PageShell>
	);
}
