import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { ViewOnGithubLink } from "./HighLevelDescription/ViewOnGithubLink";
import { findRelatedPrs } from "./HighLevelRelatedPrs/findRelatedPrs";
import { RelatedPrRow } from "./HighLevelRelatedPrs/RelatedPrRow";

const listSx = {
	listStyle: "none",
	m: 0,
	p: 0,
	display: "flex",
	flexDirection: "column",
	gap: 0.5,
} as const;

export function HighLevelRelatedPrs({
	body,
	repo,
	prNumber,
}: {
	body: string;
	repo: string;
	prNumber: number;
}) {
	const related = useMemo(
		() => findRelatedPrs(body, repo, prNumber),
		[body, repo, prNumber],
	);
	return (
		<Box
			sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}
		>
			{related.length > 0 ? (
				<Box component="ul" aria-label="Linked in the description" sx={listSx}>
					{related.map((pr) => (
						<RelatedPrRow key={pr.reference} {...pr} />
					))}
				</Box>
			) : (
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					The description links no other PRs.
				</Typography>
			)}
			<ViewOnGithubLink repo={repo} prNumber={prNumber} />
		</Box>
	);
}
