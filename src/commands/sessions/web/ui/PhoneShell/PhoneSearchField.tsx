import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { raisedBgcolor } from "../designSystem/raisedBgcolor";

const searchSx = {
	mx: 2,
	mb: 0.75,
	height: 38,
	px: 1.25,
	gap: 1,
	borderRadius: "10px",
	bgcolor: raisedBgcolor,
	fontSize: 16,
	flex: "none",
} as const;

export function PhoneSearchField({
	value,
	onChange,
	placeholder,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
}) {
	return (
		<InputBase
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			startAdornment={<SearchIcon fontSize="small" color="disabled" />}
			sx={searchSx}
			inputProps={{ "aria-label": placeholder }}
		/>
	);
}
