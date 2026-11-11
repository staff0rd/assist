import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";

export function AddNodeButton({ onClick }: { onClick: () => void }) {
	return (
		<Button
			variant="contained"
			size="small"
			startIcon={<AddIcon />}
			onClick={onClick}
		>
			Add node
		</Button>
	);
}
