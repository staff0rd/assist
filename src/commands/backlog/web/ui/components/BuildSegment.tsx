import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Button, Tooltip } from "@mui/material";
import type { MouseEvent } from "react";

export function BuildSegment({
	tooltip,
	disabled,
	onClick,
}: {
	tooltip: string;
	disabled: boolean;
	onClick: (event: MouseEvent) => void;
}) {
	return (
		<Tooltip title={tooltip}>
			<span>
				<Button
					startIcon={<PlayArrowIcon />}
					disabled={disabled}
					onClick={onClick}
				>
					Build
				</Button>
			</span>
		</Tooltip>
	);
}
