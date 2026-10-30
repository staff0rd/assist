import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";

type Props = {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
};

export function PhoneSheetToggle({ label, checked, onChange }: Props) {
	return (
		<Box component="label" sx={nodeListSx.item}>
			<Box component="span" sx={nodeListSx.grow}>
				{label}
			</Box>
			<Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
		</Box>
	);
}
