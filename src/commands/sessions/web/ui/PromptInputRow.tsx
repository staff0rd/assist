import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { PLACEHOLDER } from "./isAssistMode";

export function PromptInputRow({
	prompt,
	setPrompt,
}: {
	prompt: string;
	setPrompt: (v: string) => void;
}) {
	return (
		<Stack direction="row" spacing={1}>
			<TextField
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				placeholder={PLACEHOLDER}
				size="small"
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
	);
}
