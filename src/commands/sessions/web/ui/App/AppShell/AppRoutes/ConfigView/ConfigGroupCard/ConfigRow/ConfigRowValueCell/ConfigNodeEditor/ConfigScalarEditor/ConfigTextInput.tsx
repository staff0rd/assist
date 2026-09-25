import TextField from "@mui/material/TextField";

type Props = {
	label: string;
	value: string;
	numeric: boolean;
	helperText?: string;
	disabled: boolean;
	onChange: (value: string) => void;
};

export function ConfigTextInput({
	label,
	value,
	numeric,
	helperText,
	disabled,
	onChange,
}: Props) {
	return (
		<TextField
			size="small"
			type={numeric ? "number" : "text"}
			value={value}
			disabled={disabled}
			helperText={helperText}
			slotProps={{ htmlInput: { "aria-label": label } }}
			onChange={(event) => onChange(event.target.value)}
			sx={{ minWidth: 220 }}
		/>
	);
}
