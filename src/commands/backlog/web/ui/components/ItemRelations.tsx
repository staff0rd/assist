import type { BacklogItem, SubtaskStatus } from "../types";
import { ActivitySection } from "./ActivitySection";
import { CommentsSection } from "./CommentsSection";
import { PlanSection } from "./PlanSection";
import { SubtasksSection } from "./SubtasksSection";

export function ItemRelations({
	item,
	onRewind,
	onCommentDeleted,
	onSubtaskStatusChange,
}: {
	item: BacklogItem;
	onRewind?: () => Promise<void>;
	onCommentDeleted?: () => Promise<void>;
	onSubtaskStatusChange?: (idx: number, status: SubtaskStatus) => void;
}) {
	return (
		<>
			{item.subtasks && onSubtaskStatusChange && (
				<SubtasksSection
					subtasks={item.subtasks}
					onStatusChange={onSubtaskStatusChange}
				/>
			)}
			{item.plan && (
				<PlanSection
					phases={item.plan}
					currentPhase={item.currentPhase}
					itemId={item.id}
					usage={item.phaseUsage}
					onRewind={onRewind}
				/>
			)}
			{item.gitRefs && <ActivitySection gitRefs={item.gitRefs} />}
			{item.comments && (
				<CommentsSection
					comments={item.comments}
					itemId={item.id}
					onCommentDeleted={onCommentDeleted}
				/>
			)}
		</>
	);
}
