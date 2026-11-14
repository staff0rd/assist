import { HintKey } from "./HintKey";
import Box from "@mui/material/Box";
import { shellSx } from "../TranscriptArea/shellSx";
import { sdkComposerSx } from "./sdkComposerSx";
import { ShellKeys } from "./ShellKeys";
import { MessageKeys } from "./MessageKeys";

export function SdkComposerHint({
	running,
	stopping,
	suggestion,
	shellCwd,
	held,
	shellRunning,
}: {
	running: boolean;
	stopping: boolean;
	suggestion: boolean;
	shellCwd?: string;
	held: number;
	shellRunning: boolean;
}) {
	if (stopping)
		return <Box sx={sdkComposerSx.hint}>Waiting for Claude to stop</Box>;
	return (
		<Box sx={sdkComposerSx.hint}>
			{shellCwd === undefined ? (
				<MessageKeys suggestion={suggestion} />
			) : (
				<ShellKeys cwd={shellCwd} />
			)}
			{shellRunning && (
				<span>
					<HintKey label="Esc" /> stop command
				</span>
			)}
			{running && !shellRunning && (
				<span>
					<HintKey label="Esc" /> stop turn
				</span>
			)}
			{held > 0 && shellCwd === undefined && (
				<Box component="span" sx={shellSx.attached}>
					{held} shell result{held > 1 ? "s" : ""} will be attached
				</Box>
			)}
		</Box>
	);
}
