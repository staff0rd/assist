import Box from "@mui/material/Box";
import { sdkComposerSx } from "./sdkComposerSx";

function Key({ label }: { label: string }) {
	return (
		<Box component="kbd" sx={sdkComposerSx.kbd}>
			{label}
		</Box>
	);
}

export function SdkComposerHint({
	running,
	stopping,
}: {
	running: boolean;
	stopping: boolean;
}) {
	if (stopping)
		return <Box sx={sdkComposerSx.hint}>Waiting for Claude to stop</Box>;
	return (
		<Box sx={sdkComposerSx.hint}>
			<span>
				<Key label="Enter" /> send
			</span>
			<span>
				<Key label="Shift" />+<Key label="Enter" /> new line
			</span>
			{running && (
				<span>
					<Key label="Esc" /> stop turn
				</span>
			)}
		</Box>
	);
}
