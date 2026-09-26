import AddCircleIcon from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useSearchParams } from "react-router";
import { NewSessionTooltipTitle } from "./NewSessionButton/NewSessionTooltipTitle";

const sx = { color: "success.light" } as const;

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
			<IconButton size="small" sx={sx} aria-label="New session" onClick={open}>
				<AddCircleIcon />
			</IconButton>
		</Tooltip>
	);
}
