import { TextField } from "@mui/material";

type Props = {
	value: string;
	error?: string;
	onChange: (value: string) => void;
};

export function NodeUrlField({ value, error, onChange }: Props) {
	return (
		<TextField
			autoFocus
			label="Node URL"
			placeholder="https://mac.tail1234.ts.net:3100"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			error={!!error}
			helperText={error}
			slotProps={{
				htmlInput: {
					autoCapitalize: "none",
					autoCorrect: "off",
					inputMode: "url",
				},
			}}
		/>
	);
}
