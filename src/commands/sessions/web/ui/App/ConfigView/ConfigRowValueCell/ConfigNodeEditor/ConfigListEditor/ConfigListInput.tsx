import TextField from "@mui/material/TextField";
import { useState } from "react";

type Props = {
	label: string;
	value: unknown;
	disabled: boolean;
	onChange: (value: string[]) => void;
};

export function ConfigListInput({ label, value, disabled, onChange }: Props) {
	const [draft, setDraft] = useListDraft(joinConfigListInput(value));

	return (
		<TextField
			multiline
			minRows={2}
			size="small"
			value={draft}
			disabled={disabled}
			helperText="one entry per line"
			slotProps={{ htmlInput: { "aria-label": label } }}
			onChange={(event) => {
				setDraft(event.target.value);
				onChange(splitConfigListInput(event.target.value));
			}}
			sx={{ minWidth: 320 }}
		/>
	);
}

function useListDraft(entriesText: string): [string, (draft: string) => void] {
	const [draft, setDraft] = useState(entriesText);
	const [textOfDraft, setTextOfDraft] = useState(entriesText);

	if (entriesText !== textOfDraft) {
		setTextOfDraft(entriesText);
		setDraft(entriesText);
	}

	return [
		draft,
		(next: string) => {
			setDraft(next);
			setTextOfDraft(entriesOf(next));
		},
	];
}

function entriesOf(draft: string): string {
	return splitConfigListInput(draft).join("\n");
}

function splitConfigListInput(value: string): string[] {
	return value
		.split("\n")
		.map((entry) => entry.trim())
		.filter((entry) => entry !== "");
}

function joinConfigListInput(value: unknown): string {
	return Array.isArray(value) ? value.map(String).join("\n") : "";
}
