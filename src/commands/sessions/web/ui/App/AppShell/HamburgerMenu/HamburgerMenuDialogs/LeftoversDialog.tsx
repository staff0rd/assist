import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import type { LeftoverReport } from "../../../../../../shared/LeftoverReport";
import { useCopyFeedback } from "../../../useCopyFeedback";
import { LeftoverList } from "./LeftoverList";

const titleSx = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	pr: 1,
} as const;

export function LeftoversDialog({
	report,
	onClose,
}: {
	report: LeftoverReport;
	onClose: () => void;
}) {
	const { copied, copy } = useCopyFeedback(report.command ?? "");
	return (
		<Dialog
			open
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			aria-labelledby="leftovers-dialog-title"
		>
			<DialogTitle id="leftovers-dialog-title" sx={titleSx}>
				Leftover workspaces on {report.nodeName}
				<IconButton size="small" aria-label="Close" onClick={onClose}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers>
				<LeftoverList report={report} />
			</DialogContent>
			<DialogActions>
				<Button onClick={copy}>{copied ? "Copied" : "Copy command"}</Button>
			</DialogActions>
		</Dialog>
	);
}
