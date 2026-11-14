import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

export const queuedRowActionsClassName = "queued-row-actions";

const actionsSx = {
	ml: "auto",
	display: "inline-flex",
	gap: 0.25,
	"& .MuiIconButton-root:hover": { color: "error.main" },
} as const;

export function QueuedRowActions({ onRemove }: { onRemove: () => void }) {
	return (
		<Box component="span" className={queuedRowActionsClassName} sx={actionsSx}>
			<Tooltip title="Remove">
				<IconButton
					size="small"
					aria-label="Remove queued message"
					onClick={onRemove}
				>
					<CloseIcon />
				</IconButton>
			</Tooltip>
		</Box>
	);
}
