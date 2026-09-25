import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

type Props = {
	label: string;
	options: string[];
	descriptions?: Record<string, string>;
	taken: string[];
	value: string;
	disabled: boolean;
	onChange: (value: string) => void;
};

export function ConfigRecordKeyInput({
	label,
	options,
	descriptions,
	taken,
	value,
	disabled,
	onChange,
}: Props) {
	return (
		<TextField
			select
			size="small"
			value={options.includes(value) ? value : ""}
			disabled={disabled}
			slotProps={{ select: { inputProps: { "aria-label": label } } }}
			onChange={(event) => onChange(event.target.value)}
			sx={{ minWidth: 220 }}
		>
			{options.map((option) => (
				<MenuItem
					key={option}
					value={option}
					disabled={option !== value && taken.includes(option)}
				>
					<ListItemText primary={option} secondary={descriptions?.[option]} />
				</MenuItem>
			))}
		</TextField>
	);
}
