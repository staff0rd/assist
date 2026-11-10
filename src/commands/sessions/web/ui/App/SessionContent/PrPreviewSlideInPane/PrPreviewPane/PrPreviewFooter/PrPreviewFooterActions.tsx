import type { PrPreviewFooterProps } from "../PrPreviewFooterProps";
import { PrPreviewActions } from "./PrPreviewActions";

export function PrPreviewFooterActions({
	comments,
	cwd,
	onDecision,
	chain,
	newPr,
	canStart,
	startOrigin,
	onChainChange,
}: Pick<
	PrPreviewFooterProps,
	| "comments"
	| "cwd"
	| "onDecision"
	| "chain"
	| "newPr"
	| "canStart"
	| "startOrigin"
	| "onChainChange"
>) {
	const sent = () => comments.map((c) => ({ quote: c.quote, note: c.note }));
	return (
		<PrPreviewActions
			commentCount={comments.length}
			chain={chain}
			newPr={newPr}
			canStart={canStart}
			startOrigin={startOrigin}
			onChainChange={onChainChange}
			onApprove={() => onDecision("approve", sent())}
			cwd={cwd}
			onApproveAndStart={(startOn) =>
				onDecision("approve", sent(), startOn ?? true)
			}
			onReject={() => onDecision("reject", [])}
			onRequestChanges={() => onDecision("reject", sent())}
		/>
	);
}
