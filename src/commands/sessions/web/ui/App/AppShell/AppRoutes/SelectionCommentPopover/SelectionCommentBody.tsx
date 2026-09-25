import { Typography } from "@mui/material";
import type { ScopedRule } from "../../../../../../../rules/types";
import { CommentNoteForm } from "./SelectionCommentBody/CommentNoteForm";
import { QuoteBlock } from "../QuoteBlock";
import { RuleCitationList } from "./SelectionCommentBody/RuleCitationList";
import { useScopedRules } from "./SelectionCommentBody/useScopedRules";

export type SelectionCommentBodyProps = {
	moved?: boolean;
	editable?: boolean;
	cwd?: string | undefined;
	path?: string | undefined;
	onAdd: (note: string) => void;
	onCite?: ((rule: ScopedRule) => void) | undefined;
	onAddRule?: ((note: string) => void) | undefined;
	onCancel: () => void;
	onCollapse?: () => void;
};

export function SelectionCommentBody({
	quote,
	open,
	moved,
	editable,
	cwd,
	path,
	onAdd,
	onCite,
	onAddRule,
	onCancel,
	onCollapse,
}: SelectionCommentBodyProps & { quote: string; open: boolean }) {
	const rules = useScopedRules(cwd, path, open && Boolean(onCite));

	return (
		<>
			{moved && (
				<Typography variant="caption" color="warning.main">
					These lines changed since you selected them — your comment still
					quotes the text below.
				</Typography>
			)}
			<QuoteBlock text={quote} />
			{onCite && rules.length > 0 && (
				<RuleCitationList rules={rules} onCite={onCite} />
			)}
			<CommentNoteForm
				key={quote}
				onAdd={onAdd}
				onAddRule={onAddRule}
				onCancel={onCancel}
				onCollapse={editable ? onCollapse : undefined}
			/>
		</>
	);
}
