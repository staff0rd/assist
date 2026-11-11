import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AddNodeActions } from "./AddNodeDialog/AddNodeActions";
import { NodeUrlField } from "./AddNodeDialog/NodeUrlField";
import { ProbeOutcome } from "./AddNodeDialog/ProbeOutcome";
import { useAddNode } from "./AddNodeDialog/useAddNode";

export function AddNodeDialog({
	onClose,
	onLinked,
}: {
	onClose: () => void;
	onLinked: (notice: string) => void;
}) {
	const { url, changeUrl, step, error, submit } = useAddNode(onLinked);
	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth="xs"
			fullWidth
			aria-labelledby="add-node-title"
		>
			<Box
				component="form"
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					submit();
				}}
			>
				<DialogTitle id="add-node-title">Add node</DialogTitle>
				<DialogContent>
					<Stack spacing={2}>
						<Typography variant="body2" color="text.secondary">
							Paste the other machine's assist web server URL. Check reads its
							node name and version before anything is linked.
						</Typography>
						<NodeUrlField
							value={url}
							disabled={step.kind === "linking"}
							onChange={changeUrl}
						/>
						<ProbeOutcome step={step} error={error} />
					</Stack>
				</DialogContent>
				<AddNodeActions
					step={step}
					error={error}
					hasUrl={!!url.trim()}
					onCancel={onClose}
				/>
			</Box>
		</Dialog>
	);
}
