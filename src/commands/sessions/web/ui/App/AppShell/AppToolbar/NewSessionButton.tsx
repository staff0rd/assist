import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import type { Theme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { useSearchParams } from "react-router";
import { NewSessionTooltipTitle } from "./NewSessionButton/NewSessionTooltipTitle";

const appBarColour = (t: Theme) =>
	t.palette.mode === "dark" ? t.palette.grey[900] : t.palette.primary.main;

const sx = {
	width: 28,
	height: 28,
	ml: 0.5,
	bgcolor: "common.white",
	color: appBarColour,
	"&:hover": { bgcolor: "grey.300" },
} as const;

const plusSx = {
	fontSize: 22,
	stroke: "currentColor",
	strokeWidth: 1,
} as const;

export function NewSessionButton() {
	const [, setSearchParams] = useSearchParams();

	const open = () =>
		setSearchParams(
			(params) => {
				params.set("new", "");
				return params;
			},
			{ replace: true },
		);

	return (
		<Tooltip title={<NewSessionTooltipTitle />}>
			<IconButton sx={sx} aria-label="New session" onClick={open}>
				<AddIcon sx={plusSx} />
			</IconButton>
		</Tooltip>
	);
}
