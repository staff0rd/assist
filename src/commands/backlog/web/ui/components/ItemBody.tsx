import { Box, Paper, Typography } from "@mui/material";
import { marked } from "marked";
import type { BacklogItem } from "../types";
import { AcceptanceCriteriaList } from "./AcceptanceCriteriaList";
import { CommentsSection } from "./CommentsSection";
import { ItemMeta } from "./ItemMeta";
import { PlanSection } from "./PlanSection";

const markdownSx = { lineHeight: 1.7, "& p": { mt: 0 } } as const;
const sectionHeadingSx = {
	color: "text.secondary",
	mb: 1,
	display: "block",
	letterSpacing: "0.08em",
} as const;

function MarkdownBlock({ content }: { content: string }) {
	return (
		<Box
			className="markdown"
			sx={markdownSx}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: markdown rendering requires innerHTML
			dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
		/>
	);
}

export function ItemBody({
	item,
	onStatusChange,
	onRewind,
}: {
	item: BacklogItem;
	onStatusChange?: (status: BacklogItem["status"]) => void;
	onRewind?: () => Promise<void>;
}) {
	return (
		<Paper variant="outlined" sx={{ p: 3 }}>
			<Typography variant="h5" component="h2">
				{item.name}
			</Typography>
			<ItemMeta item={item} onStatusChange={onStatusChange} />
			{item.description && (
				<Box sx={{ mb: 2 }}>
					<Typography variant="overline" sx={sectionHeadingSx}>
						Description
					</Typography>
					<MarkdownBlock content={item.description} />
				</Box>
			)}
			<AcceptanceCriteriaList criteria={item.acceptanceCriteria} />
			{item.plan && (
				<PlanSection
					phases={item.plan}
					currentPhase={item.currentPhase}
					itemId={item.id}
					onRewind={onRewind}
				/>
			)}
			{item.comments && <CommentsSection comments={item.comments} />}
		</Paper>
	);
}
