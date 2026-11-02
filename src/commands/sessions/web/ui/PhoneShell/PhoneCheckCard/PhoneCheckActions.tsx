import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";
import type {
	CheckResult,
	LaterPhase,
} from "../../../../shared/askCheckInputSchema";
import { PhoneCheckNoteField } from "./PhoneCheckNoteField";
import { PhoneLaterPhasePicker } from "./PhoneLaterPhasePicker";

const buttonSx = { borderRadius: "12px", flex: 1 } as const;

export function PhoneCheckActions({
	laterPhases,
	onResult,
}: {
	laterPhases: LaterPhase[];
	onResult: (result: CheckResult, note: string, phase?: number) => void;
}) {
	const [note, setNote] = useState("");
	const [sending, setSending] = useState(false);
	const send = (result: CheckResult, phase?: number) => {
		setSending(true);
		onResult(result, note, phase);
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
			<Box sx={{ display: "flex", gap: 1 }}>
				<Button
					variant="outlined"
					color="error"
					sx={buttonSx}
					disabled={sending}
					onClick={() => send("doesn't work")}
				>
					Doesn't work
				</Button>
				<Button
					variant="contained"
					color="success"
					disableElevation
					sx={buttonSx}
					disabled={sending}
					onClick={() => send("works")}
				>
					Works
				</Button>
			</Box>
		</>
	);
}
