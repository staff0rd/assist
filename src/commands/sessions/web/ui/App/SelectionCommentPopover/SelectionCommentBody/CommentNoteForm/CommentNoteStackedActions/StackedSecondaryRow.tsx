import { Box, Button } from "@mui/material";
import type { CommentNoteActionsProps } from "../CommentNoteActionsProps";

const rowSx = { display: "flex", gap: 1 } as const;
const buttonSx = { flex: 1 } as const;

export function StackedSecondaryRow({
	disabled,
	onAddRule,
	onCancel,
	onCollapse,
}: CommentNoteActionsProps) {
	return (
		<Box sx={rowSx}>
			<Button variant="outlined" sx={buttonSx} onClick={onCancel}>
				Cancel
			</Button>
			{onCollapse && (
				<Button variant="outlined" sx={buttonSx} onClick={onCollapse}>
					Collapse
				</Button>
			)}
			{onAddRule && (
				<Button
					variant="outlined"
					sx={buttonSx}
					disabled={disabled}
					onClick={onAddRule}
				>
					Add rule
				</Button>
			)}
		</Box>
	);
}
