import Box from "@mui/material/Box";
import { sdkComposerSx } from "./sdkComposerSx";

export function HintKey({ label }: { label: string }) {
	return (
		<Box component="kbd" sx={sdkComposerSx.kbd}>
			{label}
		</Box>
	);
}
