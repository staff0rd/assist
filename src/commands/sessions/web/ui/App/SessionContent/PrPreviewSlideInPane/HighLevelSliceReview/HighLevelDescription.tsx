import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Link, Typography } from "@mui/material";
import { useMemo } from "react";
import { MarkdownHtml } from "../../../../../../../backlog/web/ui/components/MarkdownHtml";
import type { HighLevelCheckResult } from "../../../../../../../review/highLevel/types";
import { transcriptMarkdownSx } from "../../SessionArea/TranscriptArea/TranscriptPane/TranscriptRow/TextRow/transcriptMarkdownSx";
import { descriptionMarksSx } from "./HighLevelDescription/descriptionMarksSx";
import { HighLevelDescriptionChips } from "./HighLevelDescription/HighLevelDescriptionChips";
import { matchedIssueReference } from "./HighLevelDescription/matchedIssueReference";
import { renderDescriptionMarkdown } from "./HighLevelDescription/renderDescriptionMarkdown";
import { highLevelDescriptionChecks } from "./highLevelDescriptionChecks";

export function HighLevelDescription({
	body,
	repo,
	prNumber,
	checks,
	showChecks,
}: {
	body: string;
	repo: string;
	prNumber: number;
	checks: HighLevelCheckResult[];
	showChecks: boolean;
}) {
	const html = useMemo(
		() => renderDescriptionMarkdown(body, matchedIssueReference(body, checks)),
		[body, checks],
	);
	return (
		<Box
			sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}
		>
			{showChecks && (
				<HighLevelDescriptionChips
					checks={highLevelDescriptionChecks(checks)}
				/>
			)}
			{body.trim() ? (
				<MarkdownHtml
					className="markdown"
					sx={[transcriptMarkdownSx, descriptionMarksSx]}
					html={html}
				/>
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
