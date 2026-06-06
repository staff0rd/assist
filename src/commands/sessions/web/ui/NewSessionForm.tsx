import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { SessionFormControls } from "./SessionFormControls";
import { type FormDeps, useNewSessionForm } from "./useNewSessionForm";

export function NewSessionForm(props: FormDeps) {
	const { runConfigs } = props;
	const form = useNewSessionForm(props);
	const hasRepo = form.selectedCwd !== "";

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
					Select a repo in the toolbar to create a session
				</Typography>
			)}
		</Box>
	);
}
