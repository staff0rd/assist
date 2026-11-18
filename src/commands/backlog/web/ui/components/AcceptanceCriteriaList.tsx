import { Box, List, ListItem, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { itemSectionAnchor } from "./itemSectionAnchor";
import { MarkdownHtml } from "./MarkdownHtml";
import { renderMarkdownInline } from "./renderMarkdown";
import { sectionHeadingSx } from "./sectionHeadingSx";
import { sessionTextSize } from "../../../../sessions/web/ui/App/sessionTextSize";

type AcceptanceCriteriaListProps = {
	criteria: string[];
};

const listSx = { maxWidth: "68ch", fontSize: sessionTextSize(14) } as const;

const markerSx = (t: Theme) => ({
	mr: 1,
	minWidth: 14,
	color: "text.disabled",
	fontFamily: t.typography.fontFamilyMono,
	fontSize: sessionTextSize(12),
});

export function AcceptanceCriteriaList({
	criteria,
}: AcceptanceCriteriaListProps) {
	if (criteria.length === 0) return null;
	return (
		<Box {...itemSectionAnchor("acceptanceCriteria")}>
			<Typography variant="overline" sx={sectionHeadingSx}>
				Acceptance Criteria
			</Typography>
			<List disablePadding sx={listSx}>
				{criteria.map((ac, i) => (
					<ListItem
						key={ac}
						disableGutters
						disablePadding
						sx={{ py: 0.5, display: "flex", alignItems: "baseline" }}
					>
						<Typography component="span" sx={markerSx}>
							{i + 1}.
						</Typography>
						<MarkdownHtml
							component="span"
							className="markdown"
							html={renderMarkdownInline(ac)}
						/>
					</ListItem>
				))}
			</List>
		</Box>
	);
}
