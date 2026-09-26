import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useSearchParams } from "react-router";
import { NewSessionTooltipTitle } from "./NewSessionButton/NewSessionTooltipTitle";

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
			<IconButton size="small" aria-label="New session" onClick={open}>
				<AddIcon fontSize="small" />
			</IconButton>
		</Tooltip>
	);
}
