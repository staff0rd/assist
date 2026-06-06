import { Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

type EmptyBacklogProps = {
	onInit: () => Promise<void>;
};

const containerSx = {
	alignItems: "center",
	textAlign: "center",
	py: 8,
} as const;

export function EmptyBacklog({ onInit }: EmptyBacklogProps) {
	const [initializing, setInitializing] = useState(false);
	return (
		<Stack spacing={2} sx={containerSx}>
			<Typography variant="h6">No backlog in this repo</Typography>
			<Typography color="text.secondary">
				Initialize a backlog to start tracking items for this repository.
			</Typography>
			<Button
				variant="contained"
				disabled={initializing}
				onClick={() => {
					setInitializing(true);
					onInit();
				}}
			>
				Initialize backlog in this repo
			</Button>
		</Stack>
	);
}
