import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import IconButton from "@mui/material/IconButton";
import { shellSx } from "../TranscriptArea/shellSx";
import { sdkComposerSx } from "./sdkComposerSx";

export function SdkComposerActions({
	running,
	stopping,
	shell,
	canSend,
	onStop,
	onSend,
}: {
	running: boolean;
	stopping: boolean;
	shell: boolean;
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
				aria-label={shell ? "Run command" : "Send"}
				title={shell ? "Run (Enter)" : "Send (Enter)"}
				sx={[sdkComposerSx.send, shell && shellSx.run]}
				disabled={!canSend}
				onClick={onSend}
			>
				{shell ? (
					<PlayArrowRoundedIcon fontSize="small" />
				) : (
					<ArrowUpwardIcon fontSize="small" />
				)}
			</IconButton>
		</>
	);
}
