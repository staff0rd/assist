import type {
	RuleChange,
	RuleEntry,
	RuleScope,
} from "../../../../../rules/types";
import { RuleDeleteConfirm } from "./RuleDeleteConfirm";
import { RuleEditor } from "./RuleEditor";

type Props = {
	mode: "edit" | "delete" | undefined;
	label: string;
	rule: RuleEntry;
	scope: RuleScope;
	scopes: RuleScope[];
	onPropose: (change: RuleChange) => Promise<string | undefined>;
	onClose: () => void;
};

export function RuleRowForm({
	mode,
	label,
	rule,
	scope,
	scopes,
	onPropose,
	onClose,
}: Props) {
	if (mode === "edit")
		return (
			<RuleEditor
				scope={scope}
				rule={rule}
				scopes={scopes}
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
