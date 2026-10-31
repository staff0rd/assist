import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";

export function SaveLinkButton({
	name,
	onSave,
}: {
	name: string;
	onSave: () => void;
}) {
	return (
		<IconButton
			aria-label={`Save ${name} as a home node`}
			onClick={onSave}
			sx={{ color: "primary.main", borderRadius: 0 }}
		>
			<AddIcon fontSize="small" />
		</IconButton>
	);
}
