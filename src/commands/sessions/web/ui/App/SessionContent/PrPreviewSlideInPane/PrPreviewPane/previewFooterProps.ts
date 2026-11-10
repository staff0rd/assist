import type { ScopedRule } from "../../../../../../../rules/types";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import type { PrPreviewFooterProps } from "./PrPreviewFooterProps";
import type { usePrPane } from "./usePrPane";
import type { usePreviewCommentSender } from "./usePreviewCommentSender";

export function previewFooterProps({
	preview,
	pane,
	cwd,
	isPr,
	editable,
	sender,
	onCite,
	onAddRule,
}: {
	preview: PrPreview;
	pane: ReturnType<typeof usePrPane>;
	cwd: string | undefined;
	isPr: boolean;
	editable: boolean;
	sender: ReturnType<typeof usePreviewCommentSender>;
	onCite: ((rule: ScopedRule) => void) | undefined;
	onAddRule: ((note: string) => void) | undefined;
}): PrPreviewFooterProps {
	return {
		comments: pane.comments,
		commentColors: pane.commentColors,
		pending: pane.pending,
		cwd,
		unavailable: sender.unavailable,
		onAdd: sender.onSend,
		onQueue: pane.onAdd,
		onCite,
		onAddRule,
		onRemove: pane.remove,
		onCancel: pane.onCancel,
		onCollapse: pane.onCollapse,
		onDecision: pane.onDecide,
		chain: isPr ? pane.chain : undefined,
		editable,
		newPr: isPr && preview.prNumber === null,
		canStart: preview.kind === "backlog-item" && preview.canStart === true,
		startOrigin: preview.startOrigin,
		onChainChange: pane.setChain,
	};
}
