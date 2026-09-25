import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { FormEvent, ReactNode } from "react";
import { PLACEHOLDER } from "./dispatchMode";
import { handleEnterSubmit } from "./handleEnterSubmit";
import { promptFormSx } from "./FreePromptForm/promptFormSx";

export function FreePromptForm({
	value,
	onChange,
	onSubmit,
	header,
	anchored = false,
}: {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	header?: ReactNode;
	anchored?: boolean;
}) {
	return (
		<Paper elevation={anchored ? 0 : 4} sx={promptFormSx(anchored)}>
			<Stack
				component="form"
				spacing={1}
				sx={{ p: 1 }}
				onSubmit={(e: FormEvent) => {
					e.preventDefault();
					onSubmit();
				}}
			>
				{header}
				<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
					<TextField
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onKeyDown={handleEnterSubmit}
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
			</Stack>
		</Paper>
	);
}
