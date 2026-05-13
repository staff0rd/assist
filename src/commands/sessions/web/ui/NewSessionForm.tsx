import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRepoSelectionContext } from "./RepoSelectionProvider";
import { SessionFormControls } from "./SessionFormControls";
import { type FormDeps, useNewSessionForm } from "./useNewSessionForm";

type Props = Omit<FormDeps, "selectedCwd">;

export function NewSessionForm(props: Props) {
	const { runConfigs } = props;
	const { selectedCwd } = useRepoSelectionContext();
	const form = useNewSessionForm({ ...props, selectedCwd });
	const hasRepo = selectedCwd !== "";

	return (
		<Box
			component="form"
			onSubmit={form.handleSubmit}
			sx={{
				p: 1.5,
				borderTop: 1,
				borderColor: "divider",
				display: "flex",
				flexDirection: "column",
				gap: 1,
			}}
		>
			{runConfigs.length > 0 && (
				<TextField
					value={form.runFilter}
					onChange={(e) => form.setRunFilter(e.target.value)}
					placeholder="Filter runs..."
					size="small"
					fullWidth
					slotProps={{ input: { sx: { fontSize: 13 } } }}
				/>
			)}
			{hasRepo ? (
				<SessionFormControls form={form} totalRunCount={runConfigs.length} />
			) : (
				<Typography variant="caption" color="text.disabled" sx={{ py: 0.75 }}>
					Select a repo above to create a session
				</Typography>
			)}
		</Box>
	);
}
