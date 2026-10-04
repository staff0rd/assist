import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";

export function ExpandButton({
	open,
	label,
	onToggle,
}: {
	open: boolean;
	label: string;
	onToggle: () => void;
}) {
	return (
		<IconButton
			size="small"
			onClick={onToggle}
			aria-expanded={open}
			aria-label={label}
			sx={{ width: 28, height: 28 }}
		>
			<ChevronRightIcon
				fontSize="small"
				sx={{
					transition: "transform .2s ease",
					transform: open ? "rotate(90deg)" : "none",
				}}
			/>
		</IconButton>
	);
}
