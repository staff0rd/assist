import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import type { AddNodeStep } from "./FoundNode";
import { submitLabel } from "./submitLabel";

export function AddNodeActions({
	step,
	hasUrl,
	error,
	onCancel,
}: {
	step: AddNodeStep;
	hasUrl: boolean;
	error: string | null;
	onCancel: () => void;
}) {
	const busy = step.kind === "checking" || step.kind === "linking";
	return (
		<DialogActions>
			<Button onClick={onCancel}>Cancel</Button>
			<Button type="submit" variant="contained" disabled={busy || !hasUrl}>
				{step.kind === "idle" && error ? "Check again" : submitLabel(step)}
			</Button>
		</DialogActions>
	);
}
