import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Button, IconButton, Tooltip } from "@mui/material";
import type { MouseEvent } from "react";

export function PlayButton({
	tooltip,
	disabled,
	compact,
	onClick,
}: {
	tooltip: string;
	disabled: boolean;
	compact: boolean;
	onClick: (event: MouseEvent) => void;
}) {
	return (
		<Tooltip title={tooltip}>
			<span>
				{compact ? (
					<IconButton
						aria-label="Build"
						color="success"
						size="small"
						disabled={disabled}
						onClick={onClick}
					>
						<PlayArrowIcon />
					</IconButton>
				) : (
					<Button
						variant="contained"
						color="success"
						size="small"
						startIcon={<PlayArrowIcon />}
						disabled={disabled}
						onClick={onClick}
					>
						Build
					</Button>
				)}
			</span>
		</Tooltip>
	);
}
