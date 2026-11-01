import Box from "@mui/material/Box";
import type { PrPreview } from "../../../../shared/SessionInfoBase";
import { previewChip } from "../../App/SessionContent/PrPreviewHeader/previewChip";
import { previewKindLabel } from "./previewKindLabel";
import { previewSummary } from "./previewSummary";

const kindSx = {
	fontSize: 12,
	fontWeight: 600,
	letterSpacing: ".04em",
	textTransform: "uppercase",
} as const;

const titleSx = { fontSize: 18, fontWeight: 600, lineHeight: 1.3 } as const;

const summarySx = {
	fontSize: 14,
	lineHeight: 1.5,
	color: "text.secondary",
	display: "-webkit-box",
	WebkitLineClamp: 4,
	WebkitBoxOrient: "vertical",
	overflow: "hidden",
} as const;

function kindColor(preview: PrPreview) {
	const { color } = previewChip(preview, preview.draft === true);
	return color === "default" ? "text.secondary" : `${color}.main`;
}

export function PhonePreviewCardHeading({ preview }: { preview: PrPreview }) {
	const summary = previewSummary(preview.body);
	return (
		<>
			<Box sx={{ ...kindSx, color: kindColor(preview) }}>
				{previewKindLabel(preview)}
			</Box>
			<Box sx={titleSx}>{preview.title}</Box>
			{summary && <Box sx={summarySx}>{summary}</Box>}
		</>
	);
}
