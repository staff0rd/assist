import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { MarkdownHtml } from "../../../../../../../backlog/web/ui/components/MarkdownHtml";
import type { HighLevelCheckResult } from "../../../../../../../review/highLevel/types";
import { baseTranscriptMarkdownSx } from "../../SessionArea/TranscriptArea/TranscriptPane/TranscriptRow/TextRow/baseTranscriptMarkdownSx";
import { transcriptHeadingSx } from "../../SessionArea/TranscriptArea/TranscriptPane/TranscriptRow/TextRow/transcriptHeadingSx";
import { descriptionMarksSx } from "./HighLevelDescription/descriptionMarksSx";
import { HighLevelDescriptionChips } from "./HighLevelDescription/HighLevelDescriptionChips";
import { matchedIssueReference } from "./HighLevelDescription/matchedIssueReference";
import { descriptionImageSrc } from "./HighLevelDescription/descriptionImageSrc";
import { renderDescriptionMarkdown } from "./HighLevelDescription/renderDescriptionMarkdown";
import { ViewOnGithubLink } from "./HighLevelDescription/ViewOnGithubLink";
import { highLevelDescriptionChecks } from "./highLevelDescriptionChecks";

export function HighLevelDescription({
	body,
	repo,
	prNumber,
	checks,
}: {
	body: string;
	repo: string;
	prNumber: number;
	checks: HighLevelCheckResult[];
}) {
	const html = useMemo(
		() =>
			renderDescriptionMarkdown(
				body,
				matchedIssueReference(body, checks),
				descriptionImageSrc(repo, prNumber),
			),
		[body, checks, repo, prNumber],
	);
	return (
		<Box
			sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}
		>
			<HighLevelDescriptionChips checks={highLevelDescriptionChecks(checks)} />
			{body.trim() ? (
				<MarkdownHtml
					className="markdown"
					sx={[
						baseTranscriptMarkdownSx,
						transcriptHeadingSx,
						descriptionMarksSx,
					]}
					html={html}
				/>
			) : (
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					No description
				</Typography>
			)}
			<ViewOnGithubLink repo={repo} prNumber={prNumber} />
		</Box>
	);
}
