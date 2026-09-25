import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";

type Props = {
	option: string;
	description?: string;
	checked: boolean;
};

export function ConfigEnumListOption({ option, description, checked }: Props) {
	return (
		<>
			<Checkbox checked={checked} size="small" />
			<ListItemText primary={option} secondary={description} />
		</>
	);
}
