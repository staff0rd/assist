import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { dropdownStyle } from "./DropdownWrapper";

export function FilterDropdown({
	items,
	selected,
	onToggle,
}: {
	items: string[];
	selected: Set<string>;
	onToggle: (item: string) => void;
}) {
	return (
		<MenuList dense sx={dropdownStyle}>
			{items.map((item) => (
				<MenuItem key={item} onClick={() => onToggle(item)} dense>
					<Checkbox
						size="small"
						checked={selected.has(item)}
						sx={{ p: 0, mr: 1 }}
					/>
					<ListItemText
						primary={item}
						slotProps={{ primary: { variant: "caption" } }}
					/>
				</MenuItem>
			))}
		</MenuList>
	);
}
