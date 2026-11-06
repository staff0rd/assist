import { Box, Button, Typography } from "@mui/material";
import type { CommentNoteActionsProps } from "./CommentNoteActionsProps";
import { StackedSecondaryRow } from "./CommentNoteStackedActions/StackedSecondaryRow";

const rowSx = { display: "flex", gap: 1 } as const;
const buttonSx = { flex: 1 } as const;

export function CommentNoteStackedActions(props: CommentNoteActionsProps) {
	const { disabled, unavailable, onAdd, onQueue } = props;
	const queuePrimary = Boolean(unavailable);
	return (
		<>
			{unavailable && (
				<Typography variant="caption" color="text.secondary">
					{unavailable}
				</Typography>
			)}
			<Box sx={rowSx}>
				{onQueue && (
					<Button
						variant={queuePrimary ? "contained" : "tonal"}
						sx={buttonSx}
						disabled={disabled}
						onClick={onQueue}
					>
						Add to review
					</Button>
				)}
				<Button
					variant={queuePrimary ? "tonal" : "contained"}
					sx={buttonSx}
					disabled={disabled || queuePrimary}
					onClick={onAdd}
				>
					Send to agent
				</Button>
			</Box>
			<StackedSecondaryRow {...props} />
		</>
	);
}
