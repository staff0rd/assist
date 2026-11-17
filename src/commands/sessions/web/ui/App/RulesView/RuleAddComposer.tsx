import { Box, Typography } from "@mui/material";
import { useState } from "react";
import type { RuleScope } from "../../../../../rules/types";
import { RuleAddComposerActions } from "./RuleAddComposerActions";
import { RuleAddNoteField } from "./RuleAddNoteField";

const composerSx = {
	px: 2,
	py: 1.5,
	borderBottom: 1,
	borderColor: "divider",
	bgcolor: "action.hover",
	display: "flex",
	flexDirection: "column",
	gap: 1,
} as const;

type Props = {
	scope: RuleScope;
	sessionName: string | undefined;
	onSend: ((note: string) => void) | undefined;
	onCancel: () => void;
};

export function RuleAddComposer({
	scope,
	sessionName,
	onSend,
	onCancel,
}: Props) {
	const [note, setNote] = useState("");
	const trimmed = note.trim();
	const canSend = Boolean(onSend) && trimmed.length > 0;
	const send = () => {
		if (canSend) onSend?.(trimmed);
	};

	return (
		<Box sx={composerSx}>
			<Typography variant="caption" color="text.secondary">
				Describe the rule for <b>{scope.name}</b>.
				{onSend &&
					sessionName &&
					` It goes to ${sessionName}, which words it and asks for your approval.`}
			</Typography>
			<RuleAddNoteField value={note} onChange={setNote} onSubmit={send} />
			<RuleAddComposerActions
				unavailable={!onSend}
				canSend={canSend}
				onSend={send}
				onCancel={onCancel}
			/>
		</Box>
	);
}
