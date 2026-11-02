import { Button, Stack } from "@mui/material";
import { useState } from "react";
import type {
	CheckResult,
	LaterPhase,
} from "../../../../../../shared/askCheckInputSchema";
import { usePreviewPrimaryAction } from "../../../usePreviewPrimaryAction";
import { CheckNoteField } from "./CheckNoteField";
import { LaterPhaseButton } from "./LaterPhaseButton";

export function CheckActions({
	laterPhases,
	onResult,
	onDismiss,
}: {
	laterPhases: LaterPhase[];
	onResult: (result: CheckResult, note: string, phase?: number) => void;
	onDismiss: () => void;
}) {
	const [note, setNote] = useState("");
	const primary = usePreviewPrimaryAction();
	return (
		<>
			<CheckNoteField value={note} onChange={setNote} />
			<Stack
				direction="row"
				spacing={1}
				sx={{
					px: 2,
					py: 1.5,
					alignItems: "center",
					justifyContent: "flex-end",
				}}
			>
				<Button variant="tonal" onClick={onDismiss}>
					Dismiss
				</Button>
				{laterPhases.length > 0 && (
					<LaterPhaseButton
						phases={laterPhases}
						onPick={(phase) => onResult("later", note, phase)}
					/>
				)}
				<Button
					color="error"
					variant="outlined"
					onClick={() => onResult("doesn't work", note)}
				>
					Doesn't work
				</Button>
				<Button
					color="success"
					variant="contained"
					onClick={() => onResult("works", note)}
					{...primary}
				>
					Works
				</Button>
			</Stack>
		</>
	);
}
