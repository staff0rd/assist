import { Box, Paper, Typography } from "@mui/material";
import type { BacklogItem } from "../types";
import { AcceptanceCriteriaList } from "./AcceptanceCriteriaList";
import { CommentsSection } from "./CommentsSection";
import { ItemMeta } from "./ItemMeta";
import { MarkdownBlock } from "./MarkdownBlock";
import { PlanSection } from "./PlanSection";

const sectionHeadingSx = {
	color: "text.secondary",
	mb: 1,
	display: "block",
	letterSpacing: "0.08em",
} as const;

export function ItemBody({
	item,
	onStatusChange,
	onRewind,
	onCommentDeleted,
}: {
	item: BacklogItem;
	onStatusChange?: (status: BacklogItem["status"]) => void;
	onRewind?: () => Promise<void>;
	onCommentDeleted?: () => Promise<void>;
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
			{item.comments && (
				<CommentsSection
					comments={item.comments}
					itemId={item.id}
					onCommentDeleted={onCommentDeleted}
				/>
			)}
		</Paper>
	);
}
