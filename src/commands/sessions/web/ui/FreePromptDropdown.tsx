import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { type FormEvent, useState } from "react";
import { DropdownWrapper, dropdownStyle } from "./DropdownWrapper";
import { PLACEHOLDER } from "./dispatchMode";

export function FreePromptDropdown({
	disabled,
	onSubmit,
}: {
	disabled: boolean;
	onSubmit: (prompt: string) => void;
}) {
	const [prompt, setPrompt] = useState("");

	return (
		<DropdownWrapper label="Prompt..." disabled={disabled}>
			{(close) => (
				<Paper
					elevation={4}
					sx={{ ...dropdownStyle, left: "auto", width: 320 }}
				>
					<Stack
						component="form"
						direction="row"
						spacing={1}
						sx={{ p: 1 }}
						onSubmit={(e: FormEvent) => {
							e.preventDefault();
							if (!prompt.trim()) return;
							onSubmit(prompt);
							setPrompt("");
							close();
						}}
					>
						<TextField
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder={PLACEHOLDER}
							size="small"
							autoFocus
							fullWidth
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
			)}
		</DropdownWrapper>
	);
}
