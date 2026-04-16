import { Box, List, ListItem, Typography } from "@mui/material";
import { marked } from "marked";
import type { PlanPhase } from "../types";

export function TaskList({
	tasks,
	marker,
}: {
	tasks: PlanPhase["tasks"];
	marker: string;
}) {
	return (
		<List disablePadding sx={{ ml: 0.5 }}>
			{tasks.map((t) => (
				<ListItem
					key={t.task}
					disableGutters
					disablePadding
					sx={{ py: 0.25, display: "flex", alignItems: "baseline" }}
				>
					<Typography component="span" sx={{ color: "text.secondary", mr: 1 }}>
						{marker}
					</Typography>
					<Box
						component="span"
						className="markdown"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: inline markdown rendering
						dangerouslySetInnerHTML={{
							__html: marked.parseInline(t.task) as string,
						}}
					/>
				</ListItem>
			))}
		</List>
	);
}
