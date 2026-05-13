import { Box, Button, Stack, Typography } from "@mui/material";
import { useCallback } from "react";
import { Route, Routes } from "react-router";
import { useRepoSelectionContext } from "../../../sessions/web/ui/RepoSelectionProvider";
import { initBacklog } from "./api";
import { ViewRouter } from "./components/ViewRouter";
import { useBacklogLoader } from "./useBacklogLoader";

const emptySx = {
	textAlign: "center",
	color: "text.secondary",
	py: 6,
	px: 2,
	alignItems: "center",
} as const;

function BacklogEmptyState({ onInit }: { onInit: () => void }) {
	return (
		<Stack spacing={2} sx={emptySx}>
			<Typography variant="body1">This repo has no backlog yet.</Typography>
			<Box>
				<Button variant="contained" onClick={onInit}>
					Initialize backlog in this repo
				</Button>
			</Box>
		</Stack>
	);
}

export function BacklogView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { items, exists, reload } = useBacklogLoader(selectedCwd);

	const handleInit = useCallback(async () => {
		await initBacklog(selectedCwd || undefined);
		await reload();
	}, [selectedCwd, reload]);

	if (exists === false) {
		return <BacklogEmptyState onInit={handleInit} />;
	}

	return (
		<Routes>
			<Route
				path="/*"
				element={<ViewRouter items={items} onReload={reload} />}
			/>
		</Routes>
	);
}
