import TextField from "@mui/material/TextField";

export function NodeUrlField({
	value,
	disabled,
	onChange,
}: {
	value: string;
	disabled: boolean;
	onChange: (value: string) => void;
}) {
	return (
		<TextField
			autoFocus
			size="small"
			label="Web server URL"
			placeholder="https://pc-linux.tail1234.ts.net:3100"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			disabled={disabled}
			slotProps={{
				htmlInput: {
					autoComplete: "off",
					spellCheck: false,
					sx: { fontFamily: "fontFamilyMono" },
				},
			}}
		/>
	);
}
