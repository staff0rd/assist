import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import InputAdornment from "@mui/material/InputAdornment";

const inputSx = {
	fontSize: 13,
	height: 36,
	pr: 1,
	cursor: "pointer",
	"& input": { cursor: "text" },
} as const;

const chevronSx = { fontSize: 16, color: "text.disabled" } as const;

export function repoComboboxSlotProps(open: boolean) {
	return {
		htmlInput: {
			role: "combobox",
			"aria-label": "Repo",
			"aria-expanded": open,
			autoComplete: "off",
		},
		input: {
			sx: inputSx,
			endAdornment: (
				<InputAdornment position="end">
					<KeyboardArrowDownIcon sx={chevronSx} />
				</InputAdornment>
			),
		},
	};
}
