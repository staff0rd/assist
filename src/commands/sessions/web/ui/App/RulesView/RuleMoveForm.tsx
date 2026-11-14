import Box from "@mui/material/Box";
import { type FormEvent, useState } from "react";
import type {
	RuleChange,
	RuleEntry,
	RuleScope,
} from "../../../../../rules/types";
import { RuleFormFooter } from "./RuleFormFooter";
import { RuleScopeSelect } from "./RuleScopeSelect";
import { useProposal } from "./useProposal";

type Props = {
	scope: RuleScope;
	rule: RuleEntry;
	scopes: RuleScope[];
	onSubmit: (change: RuleChange) => Promise<string | undefined>;
	onCancel: () => void;
};

export function RuleMoveForm({
	scope,
	rule,
	scopes,
	onSubmit,
	onCancel,
}: Props) {
	const [to, setTo] = useState(scope.id);
	const { error, sending, run } = useProposal();

	const submit = (event: FormEvent) => {
		event.preventDefault();
		const { title, text } = rule;
		void run(() =>
			onSubmit({ kind: "edit", scopeId: scope.id, rule, to, title, text }),
		);
	};

	return (
		<Box
			component="form"
			onSubmit={submit}
			aria-label={`Move ${rule.code ?? rule.title ?? "rule"}`}
			sx={{ gridColumn: "2 / 4", display: "grid", gap: 1.5, pt: 1 }}
		>
			<RuleScopeSelect value={to} scopes={scopes} onChange={setTo} />
			<RuleFormFooter
				error={error}
				submitLabel="Send for approval"
				hint="Opens in the review pane; nothing changes until you approve it."
				disabled={sending || to === scope.id}
				onCancel={onCancel}
			/>
		</Box>
	);
}
