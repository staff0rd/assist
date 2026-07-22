import { Divider } from "@mui/material";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import { PrCommentList } from "./PrCommentList";
import { type PendingComment, PrCommentPopover } from "./PrCommentPopover";
import { PrPreviewActions } from "./PrPreviewActions";
import type { LocalComment } from "./usePrComments";

export function PrPreviewFooter({
	comments,
	pending,
	onAdd,
	onRemove,
	onCancel,
	onDecision,
}: {
	comments: LocalComment[];
	pending: PendingComment | null;
	onAdd: (note: string) => void;
	onRemove: (id: number) => void;
	onCancel: () => void;
	onDecision: (
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
	) => void;
}) {
	return (
		<>
			<PrCommentList comments={comments} onRemove={onRemove} />
			<Divider />
			<PrPreviewActions
				commentCount={comments.length}
				onApprove={() => onDecision("approve", [])}
				onReject={() => onDecision("reject", [])}
				onRequestChanges={() =>
					onDecision(
						"reject",
						comments.map((c) => ({ quote: c.quote, note: c.note })),
					)
				}
			/>
			<PrCommentPopover pending={pending} onAdd={onAdd} onCancel={onCancel} />
		</>
	);
}
