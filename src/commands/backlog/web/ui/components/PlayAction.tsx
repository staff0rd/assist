import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Button, IconButton, Tooltip } from "@mui/material";
import { type MouseEvent, useState } from "react";
import { useNavigate } from "react-router";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { useRepoCwd } from "../useRepoCwd";

export function PlayAction({
	itemId,
	compact = false,
}: {
	itemId: number;
	compact?: boolean;
}) {
	const { launchAssist } = useSessionLaunchContext();
	const navigate = useNavigate();
	const cwd = useRepoCwd();
	// Latch on first click so a double-click can't spawn two sessions before
	// the list refresh flips the item out of the playable state.
	const [launched, setLaunched] = useState(false);
	const handleClick = (event: MouseEvent) => {
		event.stopPropagation();
		if (launched) return;
		setLaunched(true);
		launchAssist(["backlog", "run", String(itemId)], cwd);
		navigate("/sessions");
	};
	if (compact) {
		return (
			<Tooltip title="Build">
				<span>
					<IconButton
						component="span"
						role="button"
						aria-label="Build"
						color="success"
						size="small"
						disabled={launched}
						onClick={handleClick}
					>
						<PlayArrowIcon />
					</IconButton>
				</span>
			</Tooltip>
		);
	}
	return (
		<Button
			variant="contained"
			color="success"
			size="small"
			startIcon={<PlayArrowIcon />}
			disabled={launched}
			onClick={handleClick}
		>
			Build
		</Button>
	);
}
