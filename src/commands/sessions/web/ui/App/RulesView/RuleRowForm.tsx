import type {
	RuleChange,
	RuleEntry,
	RuleScope,
} from "../../../../../rules/types";
import type { RuleActions } from "./RuleActions";
import { RuleCommentForm } from "./RuleCommentForm";
import { RuleDeleteConfirm } from "./RuleDeleteConfirm";
import { RuleMoveForm } from "./RuleMoveForm";

export type RuleRowMode = "comment" | "move" | "delete";

type Props = {
	mode: RuleRowMode | undefined;
	label: string;
	rule: RuleEntry;
	scope: RuleScope;
	actions: RuleActions;
	onPropose: (change: RuleChange) => Promise<string | undefined>;
	onClose: () => void;
};

export function RuleRowForm({
	mode,
	label,
	rule,
	scope,
	actions,
	onPropose,
	onClose,
}: Props) {
	if (mode === "comment")
		return (
			<RuleCommentForm
				scope={scope}
				rule={rule}
				comments={actions.comments}
				onDone={onClose}
			/>
		);
	if (mode === "move")
		return (
			<RuleMoveForm
				scope={scope}
				rule={rule}
				scopes={actions.scopes}
				onSubmit={onPropose}
				onCancel={onClose}
			/>
		);
	if (mode === "delete")
		return (
			<RuleDeleteConfirm
				label={label}
				scopeName={scope.name}
				onConfirm={() => onPropose({ kind: "delete", scopeId: scope.id, rule })}
				onCancel={onClose}
			/>
		);
	return null;
}
