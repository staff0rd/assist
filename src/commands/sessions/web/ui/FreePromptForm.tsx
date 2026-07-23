import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { dropdownStyle } from "./DropdownWrapper";
import { PLACEHOLDER } from "./dispatchMode";
import { handleEnterSubmit } from "./handleEnterSubmit";

export function FreePromptForm({
	value,
	onChange,
	onSubmit,
	header,
}: {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	header?: ReactNode;
}) {
	return (
		<Paper elevation={4} sx={{ ...dropdownStyle, left: "auto", width: 320 }}>
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
			</Stack>
		</Paper>
	);
}
