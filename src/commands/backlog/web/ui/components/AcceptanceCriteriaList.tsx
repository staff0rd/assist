import { Box, List, ListItem, Typography } from "@mui/material";
import { marked } from "marked";

type AcceptanceCriteriaListProps = {
	criteria: string[];
};

export function AcceptanceCriteriaList({
	criteria,
}: AcceptanceCriteriaListProps) {
	if (criteria.length === 0) return null;
	return (
		<Box sx={{ mb: 2 }}>
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
			<List disablePadding>
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
						<Box
							component="span"
							className="markdown"
							dangerouslySetInnerHTML={{
								__html: marked.parseInline(ac) as string,
							}}
						/>
					</ListItem>
				))}
			</List>
		</Box>
	);
}
