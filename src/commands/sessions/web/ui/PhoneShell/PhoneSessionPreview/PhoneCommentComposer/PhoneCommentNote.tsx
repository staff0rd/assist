import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { CopyableQuote } from "../../../App/SelectionCommentPopover/SelectionCommentBody/CopyableQuote";
import { CiteRuleRow } from "./CiteRuleRow";
import type { PhoneCommentComposerProps } from "./PhoneCommentComposerProps";
import { PhoneComposerActions } from "./PhoneComposerActions";

const bodySx = {
	flex: 1,
	minHeight: 0,
	overflowY: "auto",
	display: "flex",
	flexDirection: "column",
	gap: 1.5,
	px: 2,
	py: 1.5,
} as const;

export function PhoneCommentNote({
	quote,
	note,
	canCite,
	onNote,
	onShowRules,
	onAdd,
	onQueue,
	onAddRule,
	...status
}: Pick<
	PhoneCommentComposerProps,
	"editing" | "unavailable" | "onAdd" | "onQueue" | "onAddRule"
> & {
	quote: string;
	note: string;
	canCite: boolean;
	onNote: (note: string) => void;
	onShowRules: () => void;
}) {
	const trimmed = note.trim();

	return (
		<>
			<Box sx={bodySx}>
				<CopyableQuote text={quote} />
				<TextField
					autoFocus
					multiline
					minRows={3}
					maxRows={10}
					placeholder="Add a note…"
					value={note}
					onChange={(e) => onNote(e.target.value)}
				/>
				{canCite && <CiteRuleRow onClick={onShowRules} />}
			</Box>
			<PhoneComposerActions
				{...status}
				disabled={trimmed.length === 0}
				onSend={() => onAdd(trimmed)}
				onQueue={() => onQueue(trimmed)}
				onAddRule={onAddRule ? () => onAddRule(trimmed) : undefined}
			/>
		</>
	);
}
