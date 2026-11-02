import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

export function FilterSelect({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
}) {
	return (
		<TextField
			select
			size="small"
			label={label}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			slotProps={{
				select: { displayEmpty: true },
				inputLabel: { shrink: true },
			}}
			sx={{ minWidth: (theme) => theme.tokens.density.filterSelectMinWidth }}
		>
			{options.map((option) => (
				<MenuItem key={option.value} value={option.value}>
					{option.label}
				</MenuItem>
			))}
		</TextField>
	);
}
