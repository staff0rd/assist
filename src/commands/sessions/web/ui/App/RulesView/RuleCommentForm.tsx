import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { type FormEvent, useState } from "react";
import type { RuleEntry, RuleScope } from "../../../../../rules/types";
import { RuleFormFooter } from "./RuleFormFooter";
import type { RuleComments } from "./useRuleComments";

type Props = {
	scope: RuleScope;
	rule: RuleEntry;
	comments: RuleComments;
	onDone: () => void;
};

export function RuleCommentForm({ scope, rule, comments, onDone }: Props) {
	const [note, setNote] = useState("");
	const { onComment, unavailable } = comments;

	const submit = (event: FormEvent) => {
		event.preventDefault();
		onComment?.({ rule, scope, note: note.trim() });
		onDone();
	};

	return (
		<Box
			component="form"
			onSubmit={submit}
			aria-label={`Comment on ${rule.code ?? rule.title ?? "rule"}`}
			sx={{ gridColumn: "2 / 4", display: "grid", gap: 1.5, pt: 1 }}
		>
			<TextField
				label="Comment"
				size="small"
				multiline
				minRows={2}
				autoFocus
				value={note}
				onChange={(event) => setNote(event.target.value)}
			/>
			<RuleFormFooter
				error={unavailable}
				submitLabel="Send comment"
				hint="Sent to the selected session with the rule's code and scope."
				disabled={!onComment || note.trim() === ""}
				onCancel={onDone}
			/>
		</Box>
	);
}
