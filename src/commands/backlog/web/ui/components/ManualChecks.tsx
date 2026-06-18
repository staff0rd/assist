import { Box, Divider, List, ListItem, Typography } from "@mui/material";
import { marked } from "marked";

export function ManualChecks({ checks }: { checks: string[] }) {
	return (
		<Box sx={{ mt: 1, pt: 1 }}>
			<Divider sx={{ mb: 1 }} />
			<Typography
				variant="overline"
				sx={{ color: "text.disabled", letterSpacing: "0.08em" }}
			>
				Manual Checks
			</Typography>
			<List disablePadding sx={{ ml: 0.5, mt: 0.5 }}>
				{checks.map((check) => (
					<ListItem
						key={check}
						disableGutters
						disablePadding
						sx={{ py: 0.25, display: "flex", alignItems: "baseline" }}
					>
						<Typography
							component="span"
							sx={{ mr: 1, fontSize: "0.875rem", color: "text.secondary" }}
						>
							{"\u2610"}
						</Typography>
						<Box
							component="span"
							className="markdown"
							sx={{ fontSize: "0.875rem", color: "text.secondary" }}
							dangerouslySetInnerHTML={{
								__html: marked.parseInline(check) as string,
							}}
						/>
					</ListItem>
				))}
			</List>
		</Box>
	);
}
