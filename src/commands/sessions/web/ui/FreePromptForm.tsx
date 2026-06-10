import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { FormEvent, KeyboardEvent } from "react";
import { dropdownStyle } from "./DropdownWrapper";
import { PLACEHOLDER } from "./dispatchMode";

function handleEnterSubmit(e: KeyboardEvent<HTMLDivElement>, value: string) {
	const isPlainEnter =
		e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing;
	if (!isPlainEnter) {
		return;
	}
	e.preventDefault();
	if (value.trim() !== "") {
		e.currentTarget.closest("form")?.requestSubmit();
	}
}

export function FreePromptForm({
	value,
	onChange,
	onSubmit,
}: {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
}) {
	return (
		<Paper elevation={4} sx={{ ...dropdownStyle, left: "auto", width: 320 }}>
			<Stack
				component="form"
				direction="row"
				spacing={1}
				sx={{ p: 1, alignItems: "flex-start" }}
				onSubmit={(e: FormEvent) => {
					e.preventDefault();
					onSubmit();
				}}
			>
				<TextField
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e: KeyboardEvent<HTMLDivElement>) =>
						handleEnterSubmit(e, value)
					}
					placeholder={PLACEHOLDER}
					size="small"
					autoFocus
					fullWidth
					multiline
					maxRows={7}
					slotProps={{ input: { sx: { fontSize: 13 } } }}
				/>
				<Button
					type="submit"
					variant="contained"
					size="small"
					sx={{ whiteSpace: "nowrap" }}
				>
					Start
				</Button>
			</Stack>
		</Paper>
	);
}
