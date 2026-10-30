import { Button, Stack, TextField } from "@mui/material";
import type { ReactNode } from "react";
import { NodeUrlField } from "./NodeUrlField";
import type { SavedNode } from "./SavedNode";
import { useNodeForm } from "./useNodeForm";

type Props = {
	initial?: SavedNode;
	submitLabel: string;
	onSubmit: (node: SavedNode) => Promise<string | undefined>;
	children?: ReactNode;
};

export function NodeForm({ initial, submitLabel, onSubmit, children }: Props) {
	const form = useNodeForm(initial, onSubmit);

	return (
		<Stack component="form" spacing={2} onSubmit={form.submit}>
			<NodeUrlField
				value={form.url}
				error={form.error}
				onChange={form.changeUrl}
			/>
			<TextField
				label="Name"
				value={form.name}
				onChange={(e) => form.setName(e.target.value)}
				helperText="Filled in from the host name. Shown on the node chip."
				slotProps={{
					htmlInput: { autoCapitalize: "none", autoCorrect: "off" },
				}}
			/>
			<Button
				type="submit"
				variant="contained"
				size="large"
				disabled={!form.url.trim() || form.busy}
			>
				{form.busy ? "Checking…" : submitLabel}
			</Button>
			{children}
		</Stack>
	);
}
