import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

export const queuedRowActionsClassName = "queued-row-actions";

const actionsSx = {
	ml: "auto",
	display: "inline-flex",
	gap: 0.25,
	"& .MuiIconButton-root[data-action='remove']:hover": { color: "error.main" },
} as const;

export function QueuedRowActions({
	onEdit,
	onRemove,
}: {
	onEdit?: () => void;
	onRemove: () => void;
}) {
	return (
		<Box component="span" className={queuedRowActionsClassName} sx={actionsSx}>
			{onEdit && (
				<Tooltip title="Edit">
					<IconButton
						size="small"
						aria-label="Edit queued message"
						onClick={onEdit}
					>
						<EditOutlinedIcon />
					</IconButton>
				</Tooltip>
			)}
			<Tooltip title="Remove">
				<IconButton
					size="small"
					data-action="remove"
					aria-label="Remove queued message"
					onClick={onRemove}
				>
					<CloseIcon />
				</IconButton>
			</Tooltip>
		</Box>
	);
}
