import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Box from "@mui/material/Box";

export function modeOptionLabel(suffix: string | undefined, labelled: string) {
	return (option: string) =>
		option === labelled && suffix ? (
			<>
				{option}
				<Box component="span" sx={{ fontWeight: 400, whiteSpace: "pre" }}>
					{` · ${suffix}`}
				</Box>
				<ArrowDropDownIcon sx={{ fontSize: 18, mr: -0.75 }} />
			</>
		) : (
			option
		);
}
