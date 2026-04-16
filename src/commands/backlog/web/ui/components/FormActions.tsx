import { Button, Stack } from "@mui/material";

type FormActionsProps = {
	submitLabel: string;
	onCancel: () => void;
};

export function FormActions({ submitLabel, onCancel }: FormActionsProps) {
	return (
		<Stack direction="row" spacing={1} sx={{ mt: 2 }}>
			<Button type="submit" variant="contained">
				{submitLabel}
			</Button>
			<Button type="button" variant="outlined" onClick={onCancel}>
				Cancel
			</Button>
		</Stack>
	);
}
