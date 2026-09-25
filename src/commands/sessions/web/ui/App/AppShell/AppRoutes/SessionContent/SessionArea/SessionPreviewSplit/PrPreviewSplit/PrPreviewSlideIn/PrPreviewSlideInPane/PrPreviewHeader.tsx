import { Box, Chip, Link, Typography } from "@mui/material";
import type { PrPreview } from "../../../../../../../../../../../shared/SessionInfoBase";
import { previewChip } from "./PrPreviewHeader/previewChip";
import { splitGithubRef } from "./PrPreviewHeader/splitGithubRef";

export function PrPreviewHeader({
	preview,
	draft,
}: {
	preview: PrPreview;
	draft: boolean;
}) {
	const chip = previewChip(preview, draft);
	const titled = splitGithubRef(preview.title);
	return (
		<Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
			<Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
				{titled ? (
					<>
						{titled.before}
						<Link
							href={titled.url}
							target="_blank"
							rel="noreferrer"
							underline="hover"
						>
							{titled.reference}
						</Link>
						{titled.after}
					</>
				) : (
					preview.title
				)}
			</Typography>
			<Chip size="small" label={chip.label} color={chip.color} />
		</Box>
	);
}
