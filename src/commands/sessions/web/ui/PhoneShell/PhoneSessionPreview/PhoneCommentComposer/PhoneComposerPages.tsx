import Box from "@mui/material/Box";
import { useState } from "react";
import { RuleCitationList } from "../../../App/SelectionCommentPopover/SelectionCommentBody/RuleCitationList";
import { useScopedRules } from "../../../App/SelectionCommentPopover/SelectionCommentBody/useScopedRules";
import type { PhoneCommentComposerProps } from "./PhoneCommentComposerProps";
import { PhoneCommentNote } from "./PhoneCommentNote";
import { PhoneComposerNav } from "./PhoneComposerNav";

export function PhoneComposerPages({
	quote,
	initialNote,
	cwd,
	onCite,
	onCancel,
	...actions
}: PhoneCommentComposerProps & { quote: string }) {
	const rules = useScopedRules(cwd, undefined, Boolean(quote && onCite));
	const [note, setNote] = useState(initialNote);
	const [showRules, setShowRules] = useState(false);

	if (showRules && onCite)
		return (
			<>
				<PhoneComposerNav
					title="Cite a rule"
					leading="Back"
					onLeading={() => setShowRules(false)}
				/>
				<Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
					<RuleCitationList fill rules={rules} onCite={onCite} />
				</Box>
			</>
		);

	return (
		<>
			<PhoneComposerNav title="Comment" leading="Cancel" onLeading={onCancel} />
			<PhoneCommentNote
				{...actions}
				quote={quote}
				note={note}
				onNote={setNote}
				canCite={Boolean(onCite) && rules.length > 0}
				onShowRules={() => setShowRules(true)}
			/>
		</>
	);
}
