import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { ConfigEnumListOption } from "./ConfigEnumListInput/ConfigEnumListOption";

type Props = {
	label: string;
	options: string[];
	descriptions?: Record<string, string>;
	value: unknown;
	disabled: boolean;
	onChange: (value: string[]) => void;
};

function selectedOf(value: unknown, options: string[]): string[] {
	if (!Array.isArray(value)) return [];
	return value.map(String).filter((entry) => options.includes(entry));
}

export function ConfigEnumListInput({
	label,
	options,
	descriptions,
	value,
	disabled,
	onChange,
}: Props) {
	const selected = selectedOf(value, options);

	return (
		<TextField
			select
			size="small"
			value={selected}
			disabled={disabled}
			helperText={`${selected.length} of ${options.length} selected`}
			slotProps={{
				select: {
					multiple: true,
					renderValue: (picked) => (picked as string[]).join(", "),
					inputProps: { "aria-label": label },
				},
			}}
			onChange={(event) => {
				const next = event.target.value;
				onChange(
					(typeof next === "string" ? next.split(",") : next).filter(
						(entry) => entry !== "",
					),
				);
			}}
			sx={{ minWidth: 320 }}
		>
			{options.map((option) => (
				<MenuItem key={option} value={option}>
					<ConfigEnumListOption
						option={option}
						description={descriptions?.[option]}
						checked={selected.includes(option)}
					/>
				</MenuItem>
			))}
		</TextField>
	);
}
