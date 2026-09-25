import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";

type Props = {
	label: string;
	disabled: boolean;
	onClick: () => void;
};

export function ConfigAddEntryButton({ label, disabled, onClick }: Props) {
	return (
		<Button
			size="small"
			startIcon={<AddIcon fontSize="inherit" />}
			aria-label={`Add ${label} entry`}
			disabled={disabled}
			onClick={onClick}
		>
			Add
		</Button>
	);
}
