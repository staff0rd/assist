import Button from "@mui/material/Button";
import { useState } from "react";
import type { CheckResult } from "../../../../shared/askCheckInputSchema";
import type { CheckActionsProps } from "../../App/SessionContent/PrPreviewSlideInPane/CheckPane/CheckActionsProps";
import { PhoneCheckNoteField } from "./PhoneCheckNoteField";
import { PhoneCheckResultRow } from "./PhoneCheckResultRow";
import { PhoneLaterPhasePicker } from "./PhoneLaterPhasePicker";

export function PhoneCheckActions({
	laterPhases,
	onResult,
	onDismiss,
}: CheckActionsProps) {
	const [note, setNote] = useState("");
	const [sending, setSending] = useState(false);
	const send = (result: CheckResult, phase?: number) => {
		setSending(true);
		onResult(result, note, phase);
	};
	const dismiss = () => {
		setSending(true);
		onDismiss(note);
	};
	return (
		<>
			<PhoneCheckNoteField value={note} onChange={setNote} />
			{laterPhases.length > 0 && (
				<PhoneLaterPhasePicker
					phases={laterPhases}
					disabled={sending}
					onPick={(phase) => send("later", phase)}
				/>
			)}
			<PhoneCheckResultRow disabled={sending} onSend={send} />
			<Button
				variant="text"
				fullWidth
				sx={{ color: "text.secondary" }}
				disabled={sending}
				onClick={dismiss}
			>
				Dismiss
			</Button>
		</>
	);
}
