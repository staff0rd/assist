import Box from "@mui/material/Box";
import { type FormEvent, useState } from "react";
import type {
	RuleChange,
	RuleEntry,
	RuleScope,
} from "../../../../../rules/types";
import { RuleEditorFooter } from "./RuleEditorFooter";
import { RuleScopeSelect } from "./RuleScopeSelect";
import { RuleTextFields } from "./RuleTextFields";
import { useProposal } from "./useProposal";

type Props = {
	scope: RuleScope;
	rule: RuleEntry;
	scopes: RuleScope[];
	onSubmit: (change: RuleChange) => Promise<string | undefined>;
	onCancel: () => void;
};

export function RuleEditor({ scope, rule, scopes, onSubmit, onCancel }: Props) {
	const [title, setTitle] = useState(rule.title ?? "");
	const [text, setText] = useState(rule.text);
	const [to, setTo] = useState(scope.id);
	const { error, sending, run } = useProposal();

	const submit = (event: FormEvent) => {
		event.preventDefault();
		const edit = { title: title.trim() || undefined, text };
		void run(() =>
			onSubmit({ kind: "edit", scopeId: scope.id, rule, to, ...edit }),
		);
	};

	return (
		<Box
			component="form"
			onSubmit={submit}
			aria-label={`Edit ${rule.code ?? rule.title ?? "rule"}`}
			sx={{ gridColumn: "2 / 4", display: "grid", gap: 1.5, pt: 1 }}
		>
			<RuleTextFields
				title={title}
				text={text}
				onTitleChange={setTitle}
				onTextChange={setText}
			/>
			<RuleScopeSelect value={to} scopes={scopes} onChange={setTo} />
			<RuleEditorFooter error={error} sending={sending} onCancel={onCancel} />
		</Box>
	);
}
