import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SessionToggle } from "../../../../../../../../../../../sessionToggles";

const captionSx = {
	color: "text.disabled",
	fontSize: "0.65rem",
	lineHeight: 1.4,
} as const;

export function CardToggleCaptions({ toggles }: { toggles: SessionToggle[] }) {
	const captions = toggles.flatMap((t) => t.caption ?? []);
	if (captions.length === 0) return null;

	return (
		<Box sx={{ display: "flex", gap: 1, minWidth: 0 }}>
			{captions.map((caption) => (
				<Typography key={caption} sx={captionSx}>
					{caption}
				</Typography>
			))}
		</Box>
	);
}
