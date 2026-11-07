import { Divider } from "@mui/material";
import { PrCommentList } from "./PrPreviewFooter/PrCommentList";
import { PrPreviewActions } from "./PrPreviewFooter/PrPreviewActions";
import type { PrPreviewFooterProps } from "./PrPreviewFooterProps";
import { SelectionCommentPopover } from "../../../SelectionCommentPopover";

export function PrPreviewFooter({
	comments,
	commentColors,
	pending,
	cwd,
	unavailable,
	onAdd,
	onQueue,
	onCite,
	onAddRule,
	onRemove,
	onCancel,
	onCollapse,
	onDecision,
	chain,
	editable,
	newPr,
	canStart,
	onChainChange,
}: PrPreviewFooterProps) {
	const sent = () => comments.map((c) => ({ quote: c.quote, note: c.note }));
	return (
		<>
			<PrCommentList
				comments={comments}
				colors={commentColors}
				onRemove={onRemove}
			/>
			<Divider />
			<PrPreviewActions
				commentCount={comments.length}
				chain={chain}
				newPr={newPr}
				canStart={canStart}
				onChainChange={onChainChange}
				onApprove={() => onDecision("approve", sent())}
				cwd={cwd}
				onApproveAndStart={(startOn) =>
					onDecision("approve", sent(), startOn ?? true)
				}
				onReject={() => onDecision("reject", [])}
				onRequestChanges={() => onDecision("reject", sent())}
			/>
			<SelectionCommentPopover
				pending={pending}
				editable={editable}
				cwd={cwd}
				unavailable={unavailable}
				onAdd={onAdd}
				onQueue={onQueue}
				onCite={onCite}
				onAddRule={onAddRule}
				onCancel={onCancel}
				onCollapse={onCollapse}
			/>
		</>
	);
}
