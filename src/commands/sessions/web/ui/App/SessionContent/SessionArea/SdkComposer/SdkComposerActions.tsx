import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import IconButton from "@mui/material/IconButton";
import { sdkComposerSx } from "./sdkComposerSx";

export function SdkComposerActions({
	running,
	stopping,
	canSend,
	onStop,
	onSend,
}: {
	running: boolean;
	stopping: boolean;
	canSend: boolean;
	onStop: () => void;
	onSend: () => void;
}) {
	return (
		<>
			{running && (
				<IconButton
					aria-label="Stop turn"
					title="Stop turn (Esc)"
					sx={sdkComposerSx.stop}
					disabled={stopping}
					onClick={onStop}
				>
					<StopRoundedIcon fontSize="small" />
				</IconButton>
			)}
			<IconButton
				aria-label="Send"
				title="Send (Enter)"
				sx={sdkComposerSx.send}
				disabled={!canSend}
				onClick={onSend}
			>
				<ArrowUpwardIcon fontSize="small" />
			</IconButton>
		</>
	);
}
