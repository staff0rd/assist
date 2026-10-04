import AddCircleIcon from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useSearchParams } from "react-router";
import { ChordTooltipTitle } from "../../ChordTooltipTitle";
import { shortcutRegistry } from "../../shortcutRegistry";

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
		<Tooltip
			title={
				<ChordTooltipTitle
					label={shortcutRegistry.newSession.label}
					chords={shortcutRegistry.newSession.chords}
				/>
			}
		>
			<IconButton size="small" sx={sx} aria-label="New session" onClick={open}>
				<AddCircleIcon />
			</IconButton>
		</Tooltip>
	);
}
