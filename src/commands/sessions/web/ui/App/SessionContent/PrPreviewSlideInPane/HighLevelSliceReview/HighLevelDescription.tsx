import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Link, Typography } from "@mui/material";
import { AssistantMarkdown } from "../../SessionArea/TranscriptArea/TranscriptPane/TranscriptRow/TextRow/AssistantMarkdown";

export function HighLevelDescription({
	body,
	repo,
	prNumber,
}: {
	body: string;
	repo: string;
	prNumber: number;
}) {
	return (
		<Box
			sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}
		>
			{body.trim() ? (
				<AssistantMarkdown text={body} />
			) : (
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					No description
				</Typography>
			)}
			<Box sx={{ borderTop: 1, borderColor: "divider", pt: 1 }}>
				<Link
					href={`https://github.com/${repo}/pull/${prNumber}`}
					target="_blank"
					rel="noopener noreferrer"
					variant="caption"
					sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
				>
					View on GitHub
					<OpenInNewIcon sx={{ fontSize: 12 }} />
				</Link>
			</Box>
		</Box>
	);
}
