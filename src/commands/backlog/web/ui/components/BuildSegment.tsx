import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, Button, Tooltip } from "@mui/material";
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
			<Box component="span" sx={{ display: "flex" }}>
				<Button
					startIcon={<PlayArrowIcon />}
					disabled={disabled}
					onClick={onClick}
				>
					Build
				</Button>
			</Box>
		</Tooltip>
	);
}
