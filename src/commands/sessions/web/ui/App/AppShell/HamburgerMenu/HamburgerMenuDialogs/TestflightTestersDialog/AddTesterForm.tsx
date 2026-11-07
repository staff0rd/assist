import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { InternalSwitch } from "./InternalSwitch";
import { useAddTesterForm } from "./useAddTesterForm";

const formSx = {
	display: "flex",
	alignItems: "center",
	gap: 1.5,
	px: 3,
	pt: 1.5,
	pb: 2,
	borderBottom: 1,
	borderColor: "divider",
} as const;

const sheetFormSx = { ...formSx, flexWrap: "wrap", px: 2, pt: 2 } as const;

export function AddTesterForm({
	sheet,
	pending,
	onAdd,
}: {
	sheet: boolean;
	pending: boolean;
	onAdd: (email: string, internal: boolean) => Promise<boolean>;
}) {
	const form = useAddTesterForm(pending, onAdd);

	return (
		<Box
			component="form"
			onSubmit={form.submit}
			sx={sheet ? sheetFormSx : formSx}
		>
			<TextField
				type="email"
				autoComplete="email"
				placeholder="name@example.com"
				size="small"
				value={form.email}
				onChange={(event) => form.setEmail(event.target.value)}
				disabled={pending}
				slotProps={{ htmlInput: { "aria-label": "Tester email" } }}
				sx={{ flex: sheet ? "1 1 100%" : 1, minWidth: 0 }}
			/>
			<InternalSwitch
				sheet={sheet}
				checked={form.internal}
				disabled={pending}
				onChange={form.setInternal}
			/>
			<Button
				type="submit"
				variant="contained"
				disabled={!form.valid || pending}
			>
				Add
			</Button>
		</Box>
	);
}
