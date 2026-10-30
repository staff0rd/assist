import { Box, Button, Stack, Typography } from "@mui/material";
import { type FormEvent, useState } from "react";
import { NodeUrlField } from "./NodeUrlField";
import { parseNodeUrl } from "./parseNodeUrl";

type Props = { onSave: (url: string) => void };

const formSx = {
	height: "100%",
	boxSizing: "border-box",
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	p: 2,
	bgcolor: "background.default",
} as const;

export function HomeNodeSetup({ onSave }: Props) {
	const [value, setValue] = useState("");
	const [error, setError] = useState<string>();

	const submit = (e: FormEvent) => {
		e.preventDefault();
		const url = parseNodeUrl(value);
		if (url) onSave(url);
		else
			setError("Enter an http(s) URL, e.g. https://mac.tail1234.ts.net:3100");
	};

	return (
		<Box component="form" onSubmit={submit} sx={formSx}>
			<Stack spacing={2} sx={{ width: "100%", maxWidth: 420 }}>
				<Typography variant="h6">Connect to a home node</Typography>
				<Typography variant="body2" color="text.secondary">
					Enter the Tailscale URL of the assist web server to view its sessions
					and those of the nodes it links to.
				</Typography>
				<NodeUrlField
					value={value}
					error={error}
					onChange={(next) => {
						setValue(next);
						setError(undefined);
					}}
				/>
				<Button type="submit" variant="contained" disabled={!value.trim()}>
					Connect
				</Button>
			</Stack>
		</Box>
	);
}
