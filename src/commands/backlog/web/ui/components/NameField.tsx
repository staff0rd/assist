import { TextField } from "@mui/material";

type NameFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

export function NameField({ value, onChange }: NameFieldProps) {
	return (
		<TextField
			label="Name"
			required
			fullWidth
			size="small"
			placeholder="Item name"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			sx={{ mb: 2 }}
		/>
	);
}
