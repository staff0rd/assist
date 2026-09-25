import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

type Props = {
	label: string;
	options: string[];
	value: string;
	disabled: boolean;
	onChange: (value: string) => void;
};

export function ConfigEnumInput({
	label,
	options,
	value,
	disabled,
	onChange,
}: Props) {
	return (
		<TextField
			select
			size="small"
			value={value}
			disabled={disabled}
			slotProps={{ select: { inputProps: { "aria-label": label } } }}
			onChange={(event) => onChange(event.target.value)}
			sx={{ minWidth: 180 }}
		>
			{options.map((option) => (
				<MenuItem key={option} value={option}>
					{option}
				</MenuItem>
			))}
		</TextField>
	);
}
