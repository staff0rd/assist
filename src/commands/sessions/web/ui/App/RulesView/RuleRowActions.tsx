import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

type Props = {
	className: string;
	label: string;
	disabled: boolean;
	onEdit: () => void;
	onDelete: () => void;
};

export function RuleRowActions({
	className,
	label,
	disabled,
	onEdit,
	onDelete,
}: Props) {
	return (
		<Box
			className={className}
			sx={{ display: "flex", gap: 0.5, transition: "opacity .2s ease" }}
		>
			<Button
				size="small"
				color="inherit"
				disabled={disabled}
				aria-label={`Edit ${label}`}
				onClick={onEdit}
			>
				Edit
			</Button>
			<Button
				size="small"
				color="error"
				disabled={disabled}
				aria-label={`Delete ${label}`}
				onClick={onDelete}
			>
				Delete
			</Button>
		</Box>
	);
}
