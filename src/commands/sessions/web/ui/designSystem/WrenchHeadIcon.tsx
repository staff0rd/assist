import SvgIcon from "@mui/material/SvgIcon";
import { wrenchHeadPath } from "./wrenchHeadPath";

const wrenchHeadSx = {
	fontSize: "inherit",
	verticalAlign: "-0.125em",
} as const;

export function WrenchHeadIcon() {
	return (
		<SvgIcon viewBox="0 0 16 16" sx={wrenchHeadSx} data-testid="wrench-head">
			<path {...wrenchHeadPath} />
		</SvgIcon>
	);
}
