import type { ReactNode } from "react";
import type { RuleEntry, RuleScope } from "../../../../../rules/types";
import { SelectionCommentLayer } from "../SelectionCommentLayer";
import { selectionActions } from "../selectionActions";
import { usePreviewSelection } from "../usePreviewSelection";
import type { RuleComments } from "./useRuleComments";

type Props = {
	rule: RuleEntry;
	scope: RuleScope;
	comments: RuleComments;
	children: ReactNode;
};

export function RuleCommentLayer({ rule, scope, comments, children }: Props) {
	const selection = usePreviewSelection();
	const path = `${scope.name} ${rule.code ?? rule.title ?? ""}`.trim();
	const { add } = selectionActions({
		path,
		pending: selection.pending,
		clear: selection.clear,
		onComment: comments.onComment,
		build: (pending, note) => ({ rule, scope, quote: pending.quote, note }),
	});

	return (
		<SelectionCommentLayer
			selection={selection}
			path={path}
			cwd={comments.cwd}
			unavailable={comments.unavailable}
			onAdd={add}
			onAddRule={undefined}
		>
			{children}
		</SelectionCommentLayer>
	);
}
