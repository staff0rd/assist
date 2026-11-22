import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

export function DismissIcon({ markDone }: { markDone: boolean }) {
	if (!markDone) return <CloseIcon sx={{ fontSize: 16 }} />;
	return (
		<CheckIcon
			data-testid="mark-done-icon"
			sx={{ fontSize: 16, color: "success.main" }}
		/>
	);
}
