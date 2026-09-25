import Switch from "@mui/material/Switch";

type Props = {
	label: string;
	checked: boolean;
	disabled: boolean;
	onChange: (value: boolean) => void;
};

export function ConfigBooleanInput({
	label,
	checked,
	disabled,
	onChange,
}: Props) {
	return (
		<Switch
			size="small"
			checked={checked}
			disabled={disabled}
			slotProps={{ input: { "aria-label": `${label} value` } }}
			onChange={(event) => onChange(event.target.checked)}
		/>
	);
}
