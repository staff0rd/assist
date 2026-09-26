import { Box, List, ListItem, Typography } from "@mui/material";
import { itemSectionAnchor } from "./itemSectionAnchor";
import { MarkdownHtml } from "./MarkdownHtml";
import { renderMarkdownInline } from "./renderMarkdown";

type AcceptanceCriteriaListProps = {
	criteria: string[];
};

export function AcceptanceCriteriaList({
	criteria,
}: AcceptanceCriteriaListProps) {
	if (criteria.length === 0) return null;
	return (
		<Box {...itemSectionAnchor("acceptanceCriteria")}>
			<Typography
				variant="overline"
				sx={{
					color: "text.secondary",
					mb: 1,
					display: "block",
					letterSpacing: "0.08em",
				}}
			>
				Acceptance Criteria
			</Typography>
			<List disablePadding sx={{ maxWidth: "72ch" }}>
				{criteria.map((ac, i) => (
					<ListItem
						key={ac}
						disableGutters
						disablePadding
						sx={{ py: 0.5, display: "flex", alignItems: "baseline" }}
					>
						<Typography
							component="span"
							sx={{ color: "text.secondary", mr: 1 }}
						>
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
