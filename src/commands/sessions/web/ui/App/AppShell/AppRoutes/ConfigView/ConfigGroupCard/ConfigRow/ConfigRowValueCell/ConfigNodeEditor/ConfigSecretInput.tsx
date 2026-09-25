import TextField from "@mui/material/TextField";
import { useState } from "react";
import {
	isRedactedSecret,
	REDACTED_SECRET,
} from "../../../../../../../../../../../../shared/redactConfigSecrets";
import type { ConfigNodeEditorProps } from "./ConfigNodeEditorRenderer";
import { maskedSecretText } from "../maskedSecretText";

export function ConfigSecretInput({
	label,
	value,
	disabled,
	onChange,
}: ConfigNodeEditorProps) {
	const [typed, setTyped] = useState<string | null>(null);
	const stored = isRedactedSecret(value) ? maskedSecretText : "";

	function edit(next: string): void {
		setTyped(next);
		onChange(next === "" ? REDACTED_SECRET : next);
	}

	return (
		<TextField
			size="small"
			type="password"
			value={typed ?? stored}
			disabled={disabled}
			autoComplete="new-password"
			slotProps={{ htmlInput: { "aria-label": label } }}
			onFocus={() => setTyped((current) => current ?? "")}
			onBlur={() => typed === "" && setTyped(null)}
			onChange={(event) => edit(event.target.value)}
			sx={{ minWidth: 220 }}
		/>
	);
}
