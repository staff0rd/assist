import type { ScopedRule } from "../../../../../../../../../../../../../rules/types";
import type { PrPreview } from "../../../../../../../../../../../../shared/SessionInfoBase";
import type { PrPreviewFooterProps } from "./PrPreviewFooterProps";
import type { usePrPane } from "./usePrPane";

export function previewFooterProps({
	preview,
	pane,
	cwd,
	isPr,
	editable,
	onCite,
	onAddRule,
}: {
	preview: PrPreview;
	pane: ReturnType<typeof usePrPane>;
	cwd: string | undefined;
	isPr: boolean;
	editable: boolean;
	onCite: ((rule: ScopedRule) => void) | undefined;
	onAddRule: ((note: string) => void) | undefined;
}): PrPreviewFooterProps {
	return {
		comments: pane.comments,
		commentColors: pane.commentColors,
		pending: pane.pending,
		cwd,
		onAdd: pane.onAdd,
		onCite,
		onAddRule,
		onRemove: pane.remove,
		onCancel: pane.onCancel,
		onCollapse: pane.onCollapse,
		onDecision: pane.onDecide,
		chain: isPr ? pane.chain : undefined,
		editable,
		newPr: isPr && preview.prNumber === null,
		onChainChange: pane.setChain,
	};
}
