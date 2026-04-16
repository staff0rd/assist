import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";

export function CustomPathInput({
	onConfirm,
	onCancel,
}: {
	onConfirm: (path: string) => void;
	onCancel: () => void;
}) {
	const [value, setValue] = useState("");
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		ref.current?.focus();
	}, []);

	return (
		<Stack
			component="form"
			direction="row"
			spacing={0.5}
			onSubmit={(e: React.FormEvent) => {
				e.preventDefault();
				e.stopPropagation();
				const p = value.trim();
				if (p) onConfirm(p);
			}}
		>
			<TextField
				inputRef={ref}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="/path/to/repo"
				size="small"
				sx={{ flex: 1 }}
				slotProps={{ input: { sx: { fontSize: 12 } } }}
				onKeyDown={(e) => {
					if (e.key === "Escape") onCancel();
				}}
			/>
			<Button
				type="submit"
				variant="contained"
				size="small"
				sx={{ minWidth: 0 }}
			>
				OK
			</Button>
			<Button
				variant="outlined"
				size="small"
				onClick={onCancel}
				sx={{ minWidth: 0 }}
			>
				Cancel
			</Button>
		</Stack>
	);
}
