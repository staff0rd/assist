import TuneIcon from "@mui/icons-material/Tune";
import { Button } from "@mui/material";
import { type MouseEvent, useState } from "react";
import { useNavigate } from "react-router";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { useRepoCwd } from "../useRepoCwd";

export function RefineAction({ itemId }: { itemId: number }) {
	const { launchAssist } = useSessionLaunchContext();
	const navigate = useNavigate();
	const cwd = useRepoCwd();
	// Latch on first click so a double-click can't spawn two refine sessions.
	const [launched, setLaunched] = useState(false);
	const handleClick = (event: MouseEvent) => {
		event.stopPropagation();
		if (launched) return;
		setLaunched(true);
		launchAssist(["backlog", "refine", String(itemId)], cwd);
		navigate("/sessions");
	};
	return (
		<Button
			variant="outlined"
			size="small"
			startIcon={<TuneIcon />}
			disabled={launched}
			onClick={handleClick}
		>
			Refine
		</Button>
	);
}
