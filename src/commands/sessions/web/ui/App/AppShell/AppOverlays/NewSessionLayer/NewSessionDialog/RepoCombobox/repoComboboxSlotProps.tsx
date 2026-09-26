import InputAdornment from "@mui/material/InputAdornment";
import { isWindowsCwd } from "../../../../../../isWindowsCwd";
import { WindowsBadge } from "../../../../../WindowsBadge";

export function repoComboboxSlotProps(open: boolean, value: string) {
	return {
		htmlInput: {
			role: "combobox",
			"aria-label": "Repo",
			"aria-expanded": open,
		},
		input: {
			sx: { fontSize: 13, height: 40 },
			endAdornment: isWindowsCwd(value) && (
				<InputAdornment position="end">
					<WindowsBadge />
				</InputAdornment>
			),
		},
	};
}
