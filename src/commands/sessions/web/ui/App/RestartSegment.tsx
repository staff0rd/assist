import { Button } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useLabelledActionsContext } from "./useLabelledActionsContext";

export function RestartSegment({
	title,
	onClick,
	onKeyDown,
}: {
	title: string;
	onClick: React.MouseEventHandler<HTMLElement>;
	onKeyDown: React.KeyboardEventHandler<HTMLElement>;
}) {
	const labelled = useLabelledActionsContext();
	return (
		<Button
			size="small"
			aria-label="Restart"
			title={title}
			onClick={onClick}
			onKeyDown={onKeyDown}
			startIcon={
				labelled ? <RestartAltIcon sx={{ fontSize: 14 }} /> : undefined
			}
			sx={{ textTransform: "none", minWidth: 0, px: 1, whiteSpace: "nowrap" }}
		>
			{labelled ? "Restart" : <RestartAltIcon sx={{ fontSize: 14 }} />}
		</Button>
	);
}
