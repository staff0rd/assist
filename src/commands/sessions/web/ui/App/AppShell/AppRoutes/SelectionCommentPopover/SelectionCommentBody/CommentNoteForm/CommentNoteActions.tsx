import { Button, Stack } from "@mui/material";

export function CommentNoteActions({
	disabled,
	onAdd,
	onAddRule,
	onCancel,
	onCollapse,
}: {
	disabled: boolean;
	onAdd: () => void;
	onAddRule?: (() => void) | undefined;
	onCancel: () => void;
	onCollapse?: (() => void) | undefined;
}) {
	return (
		<Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
			<Button size="small" onClick={onCancel}>
				Cancel
			</Button>
			{onCollapse && (
				<Button size="small" variant="outlined" onClick={onCollapse}>
					Collapse
				</Button>
			)}
			{onAddRule && (
				<Button
					size="small"
					variant="outlined"
					disabled={disabled}
					onClick={onAddRule}
				>
					Add rule
				</Button>
			)}
			<Button
				size="small"
				variant="contained"
				disabled={disabled}
				onClick={onAdd}
			>
				Add comment
			</Button>
		</Stack>
	);
}
