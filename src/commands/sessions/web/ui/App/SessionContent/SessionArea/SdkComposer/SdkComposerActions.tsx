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
	sendsSuggestion,
	onStop,
	onSend,
}: {
	running: boolean;
	stopping: boolean;
	shell: boolean;
	canSend: boolean;
	sendsSuggestion: boolean;
	onStop: () => void;
	onSend: () => void;
}) {
	const label = sendLabel(shell, sendsSuggestion);
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
				aria-label={label.aria}
				title={`${label.title} (Enter)`}
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

function sendLabel(shell: boolean, sendsSuggestion: boolean) {
	if (shell) return { aria: "Run command", title: "Run" };
	const send = sendsSuggestion ? "Send suggestion" : "Send";
	return { aria: send, title: send };
}
