import { MenuItem, Select } from "@mui/material";

type StatusSelectProps<T extends string> = {
	value: T;
	options: readonly T[];
	colors: Record<T, { bg: string; text: string }>;
	onChange: (value: T) => void;
};

export const StatusSelect = <T extends string>(props: StatusSelectProps<T>) => {
	const { value, options, colors, onChange } = props;
	return (
		<Select
			value={value}
			onChange={(e) => onChange(e.target.value as T)}
			size="small"
			sx={{
				fontSize: "0.75rem",
				fontWeight: 500,
				borderRadius: 4,
				bgcolor: colors[value].bg,
				color: colors[value].text,
				"& .MuiSelect-select": {
					py: 0.5,
					px: 1.5,
				},
				"& .MuiSelect-icon": {
					color: "inherit",
				},
			}}
		>
			{options.map((s) => (
				<MenuItem key={s} value={s}>
					{s}
				</MenuItem>
			))}
		</Select>
	);
};
